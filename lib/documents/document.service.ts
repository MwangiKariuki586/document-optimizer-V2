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
  CreateBlankDocumentInput,
  CreatePasteDocumentInput,
  CreateUploadedDocumentInput,
  CreatedDocument,
  CreatedUploadedDocument,
} from "@/lib/documents/document.types";

const EMPTY_EDITOR_JSON: Json = { type: "doc", content: [] };

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

export async function createBlankDocument(
  input: CreateBlankDocumentInput,
): Promise<CreatedDocument> {
  const title = input.title.trim();

  return createDocumentWithInitialVersion({
    userId: input.userId,
    documentPayload: {
      user_id: input.userId,
      title,
      status: "ready",
      source_type: "blank",
      file_type: "none",
      editor_json: EMPTY_EDITOR_JSON,
      current_markdown: "",
      fidelity_status: "Structure Preserved",
      word_count: 0,
    },
    versionSource: "blank",
    versionContentMarkdown: "",
    versionEditorJson: EMPTY_EDITOR_JSON,
    versionNotes: "Document created",
  });
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
