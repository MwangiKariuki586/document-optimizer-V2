import { createHash } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { loadEnvConfig } from "@next/env";
import { createSupabaseWorkerClient } from "@/lib/supabase/worker";
import { downloadOriginalFile, removeOriginalFile } from "@/lib/storage/storage.service";
import { parseFile, type ParsedFileType } from "@/lib/parsing/parse-file";
import {
  detectMimeType,
  PermanentIngestionError,
  validateDocxArchive,
  validateParsedDocument,
} from "@/lib/ingestion/file-safety";
import { PROCESSING_TIMEOUT_MS } from "@/lib/ingestion/ingestion.validators";
import type { Json, Tables } from "@/lib/supabase/types";

loadEnvConfig(process.cwd());

type QueueMessage = {
  message_id: number;
  read_count: number;
  message: { ingestionId?: string };
};
type Ingestion = Tables<"document_ingestions">;
const RETRY_DELAYS = [5, 30, 120];
const concurrency = Math.max(1, Number(process.env.INGESTION_WORKER_CONCURRENCY ?? 2));
const runOnce = process.env.INGESTION_WORKER_RUN_ONCE === "true";
let lastCleanupAt = 0;

function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event, ...fields }));
}

async function archive(messageId: number) {
  const supabase = createSupabaseWorkerClient();
  const { error } = await supabase.rpc("archive_document_ingestion_message", {
    p_message_id: messageId,
  });
  if (error) throw new Error(`Failed to archive queue message: ${error.message}`);
}

async function failOrRetry(message: QueueMessage, ingestion: Ingestion, error: unknown) {
  const supabase = createSupabaseWorkerClient();
  const permanent = error instanceof PermanentIngestionError;
  const attempt = ingestion.attempt_count + 1;
  const shouldRetry = !permanent && attempt < 3;
  const code = permanent ? error.code : "processing_failed";
  const safeMessage = permanent ? error.message : "Document processing failed. Please retry.";
  await archive(message.message_id);
  await supabase
    .from("document_ingestions")
    .update({
      attempt_count: attempt,
      queue_message_id: null,
      status: shouldRetry ? "queued" : "failed",
      stage: shouldRetry ? "retry_wait" : "failed",
      error_code: code,
      error_message: safeMessage,
      heartbeat_at: new Date().toISOString(),
    })
    .eq("id", ingestion.id);
  if (shouldRetry) {
    const { error: queueError } = await supabase.rpc("enqueue_document_ingestion", {
      p_ingestion_id: ingestion.id,
      p_delay_seconds: RETRY_DELAYS[Math.min(attempt - 1, RETRY_DELAYS.length - 1)],
    });
    if (queueError) throw queueError;
  } else if (ingestion.document_id) {
    await supabase
      .from("documents")
      .update({ status: "failed" })
      .eq("id", ingestion.document_id)
      .eq("user_id", ingestion.user_id);
  }
  log("ingestion_failed", { ingestionId: ingestion.id, attempt, permanent, code });
}

async function processMessage(message: QueueMessage) {
  const ingestionId = message.message?.ingestionId;
  if (!ingestionId) {
    await archive(message.message_id);
    return;
  }
  const supabase = createSupabaseWorkerClient();
  const { data: ingestion, error: loadError } = await supabase
    .from("document_ingestions")
    .select("*")
    .eq("id", ingestionId)
    .maybeSingle();
  if (loadError) throw loadError;
  if (!ingestion || ["completed", "duplicate_resolved"].includes(ingestion.status)) {
    await archive(message.message_id);
    return;
  }
  if (!ingestion.storage_key || !ingestion.document_id) {
    await failOrRetry(message, ingestion, new PermanentIngestionError("missing_upload", "Uploaded file is missing."));
    return;
  }

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

  try {
    const data = await downloadOriginalFile(supabase, ingestion.storage_key);
    if (data.byteLength !== ingestion.file_size) {
      throw new PermanentIngestionError("size_mismatch", "Uploaded file size does not match the request.");
    }
    const checksum = createHash("sha256").update(data).digest("hex");
    if (checksum !== ingestion.client_checksum) {
      await supabase
        .from("document_ingestions")
        .update({ verified_checksum: checksum })
        .eq("id", ingestion.id);
      throw new PermanentIngestionError("checksum_mismatch", "Uploaded file checksum does not match the selected file.");
    }
    const fileType = ingestion.file_type as ParsedFileType;
    const detectedMime = detectMimeType(fileType, data);
    if (fileType === "docx") await validateDocxArchive(data);
    await supabase
      .from("document_ingestions")
      .update({ stage: "parsing", heartbeat_at: new Date().toISOString() })
      .eq("id", ingestion.id);
    const parsed = await Promise.race([
      parseFile(fileType, data),
      sleep(PROCESSING_TIMEOUT_MS).then(() => {
        throw new PermanentIngestionError("processing_timeout", "Document processing exceeded two minutes.");
      }),
    ]);
    validateParsedDocument(parsed);
    const metrics = {
      processingMs: Date.now() - started,
      fileSize: data.byteLength,
      extractedCharacters: parsed.extractedText.length,
      editorNodes: ((parsed.editorJson as { content?: unknown[] } | null)?.content?.length ?? 0),
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
    if (finalizeError) throw finalizeError;
    await archive(message.message_id);
    log("ingestion_finalized", {
      ingestionId: ingestion.id,
      documentId: ingestion.document_id,
      result: result?.[0]?.result_status,
      durationMs: Date.now() - started,
    });
  } catch (error) {
    await failOrRetry(message, ingestion, error);
  }
}

async function readMessages(): Promise<QueueMessage[]> {
  const supabase = createSupabaseWorkerClient();
  const { data, error } = await supabase.rpc("read_document_ingestion_queue", {
    p_visibility_timeout: 300,
    p_quantity: concurrency,
  });
  if (error) throw error;
  return (data ?? []) as QueueMessage[];
}

async function cleanupAbandonedUploads() {
  if (Date.now() - lastCleanupAt < 60 * 60 * 1000) return;
  lastCleanupAt = Date.now();
  const supabase = createSupabaseWorkerClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("document_ingestions")
    .select("id,document_id,storage_key")
    .eq("status", "awaiting_upload")
    .lt("created_at", cutoff)
    .limit(100);
  if (error) throw error;
  for (const ingestion of data ?? []) {
    if (ingestion.storage_key) await removeOriginalFile(supabase, ingestion.storage_key);
    await supabase.from("document_ingestions").delete().eq("id", ingestion.id);
    if (ingestion.document_id) await supabase.from("documents").delete().eq("id", ingestion.document_id);
  }
  if (data?.length) log("abandoned_ingestions_removed", { count: data.length });
}

async function main() {
  log("worker_started", { concurrency, runOnce });
  do {
    await cleanupAbandonedUploads();
    const messages = await readMessages();
    if (messages.length > 0) await Promise.all(messages.map(processMessage));
    if (!runOnce && messages.length === 0) await sleep(2_000);
  } while (!runOnce);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
