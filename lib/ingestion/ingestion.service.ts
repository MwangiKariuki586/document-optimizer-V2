import "server-only";

import { createHash } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deriveTitleFromFileName,
  sanitizeStorageFileName,
  validateUpload,
} from "@/lib/documents/upload.validators";
import {
  downloadOriginalFile,
  removeOriginalFile,
} from "@/lib/storage/storage.service";
import { parseFile, type ParsedFileType } from "@/lib/parsing/parse-file";
import {
  detectMimeType,
  PermanentIngestionError,
  validateDocxArchive,
  validateParsedDocument,
} from "@/lib/ingestion/file-safety";
import type { Json, Tables, TablesInsert } from "@/lib/supabase/types";
import type {
  ExistingDocumentSummary,
  IngestionState,
  InitializeUploadResult,
  SignedUploadTarget,
} from "@/lib/ingestion/ingestion.types";

const DOCUMENTS_BUCKET = "documents";
const ACTIVE_STATUSES = [
  "awaiting_upload",
  "queued",
  "processing",
  "duplicate_pending",
] as const;
const MAX_ACTIVE_INGESTIONS = 3;
const INLINE_PROCESSING_MAX_BYTES = 5 * 1024 * 1024;
const INLINE_PROCESSING_TIMEOUT_MS = 4_000;
const INLINE_PROCESSING_TYPES = new Set<ParsedFileType>([
  "txt",
  "markdown",
  "docx",
  "pdf",
]);

type IngestionRow = Tables<"document_ingestions">;

function buildStorageKey(userId: string, documentId: string, fileName: string) {
  return `${userId}/${documentId}/original/${sanitizeStorageFileName(fileName)}`;
}

function directStorageUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Supabase URL is not configured");
  return url.replace(".supabase.co", ".storage.supabase.co");
}

async function existingDocumentSummary(
  userId: string,
  documentId: string | null,
): Promise<ExistingDocumentSummary | null> {
  if (!documentId) return null;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,file_type,updated_at")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load duplicate document");
  return data
    ? {
        id: data.id,
        title: data.title,
        fileType: data.file_type,
        updatedAt: data.updated_at,
      }
    : null;
}

async function signedUploadTarget(storageKey: string): Promise<SignedUploadTarget> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storageKey, { upsert: false });
  if (error || !data?.token) {
    console.error("[ingestion/sign-upload]", error?.message);
    throw new Error("Failed to prepare upload");
  }
  return {
    bucket: DOCUMENTS_BUCKET,
    objectKey: storageKey,
    token: data.token,
    storageUrl: directStorageUrl(),
  };
}

function isInlineProcessingEligible(ingestion: IngestionRow): boolean {
  return (
    ingestion.file_size <= INLINE_PROCESSING_MAX_BYTES &&
    INLINE_PROCESSING_TYPES.has(ingestion.file_type as ParsedFileType)
  );
}

async function markIngestionFailed(
  ingestion: IngestionRow,
  error: PermanentIngestionError,
) {
  const supabase = createSupabaseServerClient();
  await supabase
    .from("document_ingestions")
    .update({
      attempt_count: ingestion.attempt_count + 1,
      queue_message_id: null,
      status: "failed",
      stage: "failed",
      error_code: error.code,
      error_message: error.message,
      heartbeat_at: new Date().toISOString(),
    })
    .eq("id", ingestion.id);
  if (ingestion.document_id) {
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", ingestion.document_id)
      .eq("user_id", ingestion.user_id);
  }
}

async function processUploadInline(ingestion: IngestionRow) {
  if (!ingestion.storage_key || !ingestion.document_id) {
    throw new PermanentIngestionError("missing_upload", "Uploaded file is missing.");
  }

  const supabase = createSupabaseServerClient();
  const started = Date.now();

  await supabase
    .from("document_ingestions")
    .update({
      status: "processing",
      stage: "downloading",
      processing_started_at: new Date().toISOString(),
      heartbeat_at: new Date().toISOString(),
    })
    .eq("id", ingestion.id);

  const data = await downloadOriginalFile(supabase, ingestion.storage_key);
  if (data.byteLength !== ingestion.file_size) {
    throw new PermanentIngestionError(
      "size_mismatch",
      "Uploaded file size does not match the request.",
    );
  }
  const checksum = createHash("sha256").update(data).digest("hex");
  if (checksum !== ingestion.client_checksum) {
    await supabase
      .from("document_ingestions")
      .update({ verified_checksum: checksum })
      .eq("id", ingestion.id);
    throw new PermanentIngestionError(
      "checksum_mismatch",
      "Uploaded file checksum does not match the selected file.",
    );
  }

  const fileType = ingestion.file_type as ParsedFileType;
  const detectedMime = detectMimeType(fileType, data);
  if (fileType === "docx") {
    await validateDocxArchive(data);
  }

  await supabase
    .from("document_ingestions")
    .update({ stage: "parsing", heartbeat_at: new Date().toISOString() })
    .eq("id", ingestion.id);

  const parsed = await Promise.race([
    parseFile(fileType, data),
    sleep(INLINE_PROCESSING_TIMEOUT_MS).then(() => {
      throw new Error("Inline document processing timed out.");
    }),
  ]);
  validateParsedDocument(parsed);

  const metrics = {
    processingMs: Date.now() - started,
    fileSize: data.byteLength,
    extractedCharacters: parsed.extractedText.length,
    editorNodes:
      ((parsed.editorJson as { content?: unknown[] } | null)?.content?.length ??
        0),
    mode: "inline",
  } as Json;
  const { data: result, error: finalizeError } = await supabase.rpc(
    "finalize_document_ingestion",
    {
      p_ingestion_id: ingestion.id,
      p_verified_checksum: checksum,
      p_detected_mime_type: detectedMime,
      p_extracted_text: parsed.extractedText,
      p_current_markdown: parsed.currentMarkdown ?? "",
      p_editor_json: (parsed.editorJson ?? {}) as Json,
      p_formatting_metadata: (parsed.formattingMetadata ?? {}) as Json,
      p_fidelity_status: parsed.fidelityStatus,
      p_word_count: parsed.wordCount,
      p_metrics: metrics,
    },
  );
  if (finalizeError) {
    throw new Error(finalizeError.message);
  }

  return result?.[0]?.result_status === "duplicate_pending"
    ? "duplicate_pending"
    : "completed";
}

async function resultForExistingIngestion(
  row: IngestionRow,
): Promise<InitializeUploadResult> {
  const duplicate = await existingDocumentSummary(
    row.user_id,
    row.duplicate_document_id,
  );
  if (row.status === "duplicate_pending" && duplicate) {
    return {
      status: "duplicate_detected",
      ingestionId: row.id,
      documentId: row.document_id,
      existingDocument: duplicate,
    };
  }
  if (row.status === "awaiting_upload" && row.document_id && row.storage_key) {
    return {
      status: "upload_ready",
      ingestionId: row.id,
      documentId: row.document_id,
      upload: await signedUploadTarget(row.storage_key),
    };
  }
  return {
    status:
      row.status === "completed"
        ? "completed"
        : row.status === "failed"
          ? "failed"
          : row.status === "duplicate_resolved"
            ? "duplicate_resolved"
            : "in_progress",
    ingestionId: row.id,
    documentId: row.document_id,
    ...(duplicate ? { existingDocument: duplicate } : {}),
  };
}

export async function initializeDocumentUpload(input: {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksumSha256: string;
  idempotencyKey: string;
  duplicateDecision?: "continue_as_new";
}): Promise<InitializeUploadResult> {
  const supabase = createSupabaseServerClient();
  const validation = validateUpload({ name: input.fileName, size: input.fileSize });
  if (!validation.ok) throw new Error(validation.error);

  const { data: existingIngestion, error: existingError } = await supabase
    .from("document_ingestions")
    .select("*")
    .eq("user_id", input.userId)
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();
  if (existingError) throw new Error("Failed to inspect upload request");
  if (existingIngestion) return resultForExistingIngestion(existingIngestion);

  const { count, error: countError } = await supabase
    .from("document_ingestions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .in("status", [...ACTIVE_STATUSES]);
  if (countError) throw new Error("Failed to inspect active uploads");
  if ((count ?? 0) >= MAX_ACTIVE_INGESTIONS) {
    throw new Error("Finish an active upload before starting another one.");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("documents")
    .select("id,title,file_type,updated_at")
    .eq("user_id", input.userId)
    .eq("file_checksum", input.checksumSha256)
    .eq("status", "ready")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (duplicateError) throw new Error("Failed to inspect existing documents");

  const documentId = crypto.randomUUID();
  const ingestionId = crypto.randomUUID();
  const storageKey = buildStorageKey(input.userId, documentId, input.fileName);
  const continueAsNew = input.duplicateDecision === "continue_as_new";

  const { error: documentError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: input.userId,
    title: deriveTitleFromFileName(input.fileName),
    status: "processing",
    source_type: "upload",
    file_type: validation.fileType,
    original_file_key: storageKey,
    original_file_name: input.fileName,
    original_file_size: input.fileSize,
    original_mime_type: input.mimeType,
    fidelity_status: "Formatting Review Needed",
  });
  if (documentError) throw new Error("Failed to create processing document");

  const ingestion: TablesInsert<"document_ingestions"> = {
    id: ingestionId,
    document_id: documentId,
    user_id: input.userId,
    idempotency_key: input.idempotencyKey,
    original_file_name: input.fileName,
    file_size: input.fileSize,
    declared_mime_type: input.mimeType,
    file_type: validation.fileType,
    storage_key: storageKey,
    client_checksum: input.checksumSha256,
    status: duplicate && !continueAsNew ? "duplicate_pending" : "awaiting_upload",
    stage: duplicate && !continueAsNew ? "duplicate_review" : "awaiting_upload",
    duplicate_document_id: duplicate && !continueAsNew ? duplicate.id : null,
    duplicate_resolution: continueAsNew ? "continue_as_new" : "pending",
  };
  const { error: ingestionError } = await supabase
    .from("document_ingestions")
    .insert(ingestion);
  if (ingestionError) {
    await supabase.from("documents").delete().eq("id", documentId);
    if (ingestionError.code === "23505") {
      const { data: winner } = await supabase
        .from("document_ingestions")
        .select("*")
        .eq("user_id", input.userId)
        .eq("idempotency_key", input.idempotencyKey)
        .single();
      if (winner) return resultForExistingIngestion(winner);
    }
    throw new Error("Failed to initialize upload");
  }

  if (duplicate && !continueAsNew) {
    return {
      status: "duplicate_detected",
      ingestionId,
      documentId,
      existingDocument: {
        id: duplicate.id,
        title: duplicate.title,
        fileType: duplicate.file_type,
        updatedAt: duplicate.updated_at,
      },
    };
  }

  return {
    status: "upload_ready",
    ingestionId,
    documentId,
    upload: await signedUploadTarget(storageKey),
  };
}

export async function completeDocumentUpload(userId: string, documentId: string) {
  const supabase = createSupabaseServerClient();
  const { data: ingestion, error } = await supabase
    .from("document_ingestions")
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load upload");
  if (!ingestion) return null;
  if (["queued", "processing", "completed"].includes(ingestion.status)) {
    return { ingestionId: ingestion.id, status: ingestion.status };
  }
  if (ingestion.status !== "awaiting_upload" || !ingestion.storage_key) {
    throw new Error("Upload is not ready to complete.");
  }

  const parts = ingestion.storage_key.split("/");
  const fileName = parts.pop();
  const folder = parts.join("/");
  const { data: objects, error: storageError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .list(folder, { search: fileName, limit: 10 });
  const object = objects?.find((item) => item.name === fileName);
  const storedSize = Number(object?.metadata?.size ?? 0);
  if (storageError || !object || storedSize !== ingestion.file_size) {
    throw new Error("Uploaded file could not be verified.");
  }

  await supabase
    .from("document_ingestions")
    .update({ upload_completed_at: new Date().toISOString() })
    .eq("id", ingestion.id);

  if (isInlineProcessingEligible(ingestion)) {
    try {
      const inlineStatus = await processUploadInline(ingestion);
      return { ingestionId: ingestion.id, status: inlineStatus, mode: "inline" };
    } catch (inlineError) {
      if (inlineError instanceof PermanentIngestionError) {
        await markIngestionFailed(ingestion, inlineError);
        return { ingestionId: ingestion.id, status: "failed", mode: "inline" };
      }

      console.warn("[ingestion/inline-fallback]", {
        ingestionId: ingestion.id,
        error:
          inlineError instanceof Error
            ? inlineError.message
            : "Inline processing failed.",
      });
      await supabase
        .from("document_ingestions")
        .update({
          status: "awaiting_upload",
          stage: "awaiting_upload",
          processing_started_at: null,
          heartbeat_at: null,
        })
        .eq("id", ingestion.id);
    }
  }

  const { data: messageId, error: queueError } = await supabase.rpc(
    "enqueue_document_ingestion",
    { p_ingestion_id: ingestion.id, p_delay_seconds: 0 },
  );
  if (queueError) throw new Error("Failed to queue document processing");
  return { ingestionId: ingestion.id, status: "queued", messageId, mode: "queued" };
}

export async function getDocumentIngestion(
  userId: string,
  documentId: string,
): Promise<IngestionState | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("document_ingestions")
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load document processing state");
  if (!data) return null;
  const duplicate = await existingDocumentSummary(userId, data.duplicate_document_id);
  return {
    id: data.id,
    documentId: data.document_id,
    originalFileName: data.original_file_name,
    status: data.status as IngestionState["status"],
    stage: data.stage,
    attemptCount: data.attempt_count,
    errorCode: data.error_code,
    errorMessage: data.error_message,
    duplicateResolution: data.duplicate_resolution as IngestionState["duplicateResolution"],
    existingDocument: duplicate,
    metrics: data.metrics,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function resolveDuplicateIngestion(input: {
  userId: string;
  ingestionId: string;
  action: "open_existing" | "continue_as_new";
}) {
  const supabase = createSupabaseServerClient();
  const { data: ingestion, error } = await supabase
    .from("document_ingestions")
    .select("*")
    .eq("id", input.ingestionId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load duplicate upload");
  if (!ingestion) return null;

  const existing = await existingDocumentSummary(
    input.userId,
    ingestion.duplicate_document_id,
  );
  if (!existing) {
    input.action = "continue_as_new";
  }

  if (input.action === "open_existing" && existing) {
    if (ingestion.storage_key) await removeOriginalFile(supabase, ingestion.storage_key);
    await supabase
      .from("document_ingestions")
      .update({
        status: "duplicate_resolved",
        stage: "completed",
        duplicate_resolution: "open_existing",
        document_id: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", ingestion.id)
      .eq("user_id", input.userId);
    if (ingestion.document_id) {
      await supabase
        .from("documents")
        .delete()
        .eq("id", ingestion.document_id)
        .eq("user_id", input.userId);
    }
    return { status: "open_existing" as const, documentId: existing.id };
  }

  await supabase
    .from("document_ingestions")
    .update({
      status: ingestion.upload_completed_at ? "queued" : "awaiting_upload",
      stage: ingestion.upload_completed_at ? "queued" : "awaiting_upload",
      duplicate_resolution: "continue_as_new",
      duplicate_document_id: null,
      queue_message_id: null,
      error_code: null,
      error_message: null,
    })
    .eq("id", ingestion.id)
    .eq("user_id", input.userId);

  if (ingestion.upload_completed_at) {
    await supabase.rpc("enqueue_document_ingestion", {
      p_ingestion_id: ingestion.id,
      p_delay_seconds: 0,
    });
    return { status: "queued" as const, documentId: ingestion.document_id };
  }
  if (!ingestion.document_id || !ingestion.storage_key) {
    throw new Error("Upload cannot be continued.");
  }
  return {
    status: "upload_ready" as const,
    documentId: ingestion.document_id,
    upload: await signedUploadTarget(ingestion.storage_key),
  };
}

export async function retryDocumentIngestion(userId: string, documentId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("document_ingestions")
    .select("id,status,storage_key")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Failed to load failed ingestion");
  if (!data) return null;
  if (data.status !== "failed" || !data.storage_key) {
    throw new Error("Only failed document processing can be retried.");
  }
  await supabase
    .from("document_ingestions")
    .update({ queue_message_id: null, error_code: null, error_message: null })
    .eq("id", data.id);
  await supabase.rpc("enqueue_document_ingestion", {
    p_ingestion_id: data.id,
    p_delay_seconds: 0,
  });
  await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", documentId)
    .eq("user_id", userId);
  return { ingestionId: data.id, status: "queued" as const };
}
