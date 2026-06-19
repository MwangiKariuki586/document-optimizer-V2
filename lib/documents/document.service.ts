import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import {
  createDocumentVersion,
  type VersionSource,
} from "@/lib/versions/versions.service";
import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import {
  removeOriginalFile,
  uploadOriginalFile,
} from "@/lib/storage/storage.service";
import { parseFile } from "@/lib/parsing/parse-file";
import { FILE_TYPE_TO_DB } from "@/lib/documents/upload.validators";
import type { Json, TablesInsert } from "@/lib/supabase/types";
import type {
  CreateManualVersionInput,
  CreatePasteDocumentInput,
  CreateUploadedDocumentInput,
  CreatedDocument,
  CreatedUploadedDocument,
  EditorDocument,
  UpdateDocumentContentInput,
} from "@/lib/documents/document.types";

function getNumericMetadataValue(metadata: Json, key: string): number | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = metadata[key];
  return typeof value === "number" ? value : null;
}

type DocumentCreationConfig = {
  userId: string;
  documentPayload: TablesInsert<"documents">;
  versionSource: VersionSource;
  versionContentMarkdown: string;
  versionEditorJson: Json;
  versionNotes: string;
};

async function createDocumentWithInitialVersion(
  config: DocumentCreationConfig,
): Promise<CreatedDocument> {
  const supabase = createSupabaseServerClient();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert(config.documentPayload)
    .select("id,title")
    .single();

  if (documentError || !document) {
    console.error("[documents/create]", documentError?.message);
    throw new Error("Failed to create document");
  }

  try {
    await createDocumentVersion(supabase, {
      documentId: document.id,
      userId: config.userId,
      title: document.title,
      source: config.versionSource,
      contentMarkdown: config.versionContentMarkdown,
      editorJson: config.versionEditorJson,
      notes: config.versionNotes,
    });
  } catch (error) {
    // Roll back the orphaned document so the user can retry cleanly.
    await supabase.from("documents").delete().eq("id", document.id);
    console.error("[documents/create]", error);
    throw new Error("Failed to create document");
  }

  await recordUsageEvent(supabase, {
    userId: config.userId,
    eventType: "document_create",
    documentId: document.id,
    metadata: { source_type: config.documentPayload.source_type },
  });

  return { id: document.id, title: document.title };
}

// Loads a single document scoped to its owner. Returns null when the document
// does not exist or does not belong to the authenticated user.
export async function getDocumentForUser(
  userId: string,
  documentId: string,
): Promise<EditorDocument | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .select(
      "id,title,file_type,fidelity_status,original_file_key,editor_json,current_markdown,word_count,updated_at",
    )
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[documents/get]", error.message);
    throw new Error("Failed to load document");
  }

  if (!data) {
    return null;
  }

  // The editor's "Version N (Current)" label should point at the saved version
  // whose content matches the live document. Restoring an existing version
  // updates the live document without creating a new history row.
  const { data: versions, error: versionError } = await supabase
    .from("document_versions")
    .select("version_number,content_markdown")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .order("version_number", { ascending: false });

  if (versionError) {
    console.error("[documents/get/version]", versionError.message);
  }

  const { data: latestRestoreEvent, error: restoreEventError } = await supabase
    .from("usage_ledger")
    .select("metadata")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .eq("event_type", "version_restore")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (restoreEventError) {
    console.error("[documents/get/restore-event]", restoreEventError.message);
  }

  const currentMarkdown = data.current_markdown ?? "";
  const restoredVersionNumber = getNumericMetadataValue(
    latestRestoreEvent?.metadata ?? null,
    "selectedVersionNumber",
  );
  const restoredMatchingVersion = (versions ?? []).find(
    (version) =>
      version.version_number === restoredVersionNumber &&
      (version.content_markdown ?? "") === currentMarkdown,
  );
  const matchingVersion =
    restoredMatchingVersion ??
    (versions ?? []).find(
      (version) => (version.content_markdown ?? "") === currentMarkdown,
    );
  const latestVersion = versions?.[0];

  return {
    id: data.id,
    title: data.title,
    fileType: data.file_type,
    fidelityStatus: data.fidelity_status,
    hasOriginalFile: Boolean(data.original_file_key),
    editorJson: data.editor_json,
    currentMarkdown,
    wordCount: data.word_count,
    updatedAt: data.updated_at,
    versionNumber:
      matchingVersion?.version_number ?? latestVersion?.version_number ?? 0,
  };
}

// Saves manual editor changes. Ownership is enforced by scoping the update to the
// user's row; word count is recomputed server-side rather than trusted from the client.
// Returns null when no owned row matched (treated as not found by the route).
export async function updateDocumentContent(
  input: UpdateDocumentContentInput,
): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();
  const wordCount = countWords(input.currentMarkdown);

  const { data, error } = await supabase
    .from("documents")
    .update({
      title: input.title.trim(),
      editor_json: input.editorJson,
      current_markdown: input.currentMarkdown,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[documents/update]", error.message);
    throw new Error("Failed to save document");
  }

  if (!data) {
    return null;
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "manual_save",
    documentId: data.id,
  });

  return { id: data.id };
}

// Creates a manual version checkpoint. Persists the current editor content (so the
// document and the snapshot stay consistent) AND stores a recoverable copy in
// document_versions. Ownership is enforced by scoping the update to the user's row.
// Returns the new version number (for the editor's "Version N" label), or null
// when no owned row matched (treated as not found by the route).
export async function createManualVersion(
  input: CreateManualVersionInput,
): Promise<{ id: string; versionNumber: number } | null> {
  const supabase = createSupabaseServerClient();
  const wordCount = countWords(input.currentMarkdown);

  const { data: document, error: updateError } = await supabase
    .from("documents")
    .update({
      title: input.title.trim(),
      editor_json: input.editorJson,
      current_markdown: input.currentMarkdown,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .select("id,title,formatting_metadata")
    .maybeSingle();

  if (updateError) {
    console.error("[documents/version]", updateError.message);
    throw new Error("Failed to save document version");
  }

  if (!document) {
    return null;
  }

  const version = await createDocumentVersion(supabase, {
    documentId: document.id,
    userId: input.userId,
    title: document.title,
    source: "manual_save",
    contentMarkdown: input.currentMarkdown,
    editorJson: input.editorJson,
    formattingMetadata: document.formatting_metadata,
    notes: input.notes ?? null,
  });

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "manual_save",
    documentId: document.id,
    metadata: { versioned: true },
  });

  return { id: version.id, versionNumber: version.versionNumber };
}

export async function createPasteDocument(
  input: CreatePasteDocumentInput,
): Promise<CreatedDocument> {
  const title = input.title.trim();
  const content = normalizeText(input.content.trim());
  const editorJson = plainTextToEditorJson(content);
  const wordCount = countWords(content);

  return createDocumentWithInitialVersion({
    userId: input.userId,
    documentPayload: {
      user_id: input.userId,
      title,
      status: "ready",
      source_type: "paste",
      file_type: "none",
      extracted_text: content,
      editor_json: editorJson,
      current_markdown: content,
      fidelity_status: "Plain Text Only",
      word_count: wordCount,
    },
    versionSource: "paste",
    versionContentMarkdown: content,
    versionEditorJson: editorJson,
    versionNotes: "Document created from pasted text",
  });
}

export async function createUploadedDocument(
  input: CreateUploadedDocumentInput,
): Promise<CreatedUploadedDocument> {
  const supabase = createSupabaseServerClient();
  const documentId = crypto.randomUUID();
  const title = input.title.trim();

  // Parse first so an unreadable file fails before anything is persisted.
  const parsed = await parseFile(input.fileType, input.data);

  const fileKey = await uploadOriginalFile(supabase, {
    userId: input.userId,
    documentId,
    fileName: input.safeFileName,
    contentType: input.contentType,
    data: input.data,
  });

  const editorJson = (parsed.editorJson ?? null) as Json;
  const formattingMetadata = (parsed.formattingMetadata ?? {}) as Json;

  const documentPayload: TablesInsert<"documents"> = {
    id: documentId,
    user_id: input.userId,
    title,
    status: "ready",
    source_type: "upload",
    file_type: FILE_TYPE_TO_DB[input.fileType],
    original_file_key: fileKey,
    extracted_text: parsed.extractedText,
    editor_json: editorJson,
    current_markdown: parsed.currentMarkdown,
    formatting_metadata: formattingMetadata,
    fidelity_status: parsed.fidelityStatus,
    word_count: parsed.wordCount,
  };

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert(documentPayload)
    .select("id,title")
    .single();

  if (documentError || !document) {
    await removeOriginalFile(supabase, fileKey);
    console.error("[documents/upload]", documentError?.message);
    throw new Error("Failed to create document");
  }

  try {
    await createDocumentVersion(supabase, {
      documentId: document.id,
      userId: input.userId,
      title: document.title,
      source: "upload",
      contentMarkdown: parsed.currentMarkdown ?? "",
      editorJson,
      formattingMetadata,
      notes: "Document uploaded",
    });
  } catch (error) {
    await supabase.from("documents").delete().eq("id", document.id);
    await removeOriginalFile(supabase, fileKey);
    console.error("[documents/upload]", error);
    throw new Error("Failed to create document");
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "upload",
    documentId: document.id,
    metadata: { source_type: "upload", file_type: input.fileType },
  });

  return { id: document.id, title: document.title, warnings: parsed.warnings };
}
