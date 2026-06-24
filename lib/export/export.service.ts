import { renderExport } from "@/lib/export/export-renderers";
import type {
  CreateExportOptions,
  ExportFormat,
} from "@/lib/export/export.validators";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/supabase/types";
import {
  createSignedExportUrl,
  downloadExportFile,
  removeExportFile,
  uploadExportFile,
} from "@/lib/storage/storage.service";
import { recordUsageEvent } from "@/lib/usage/usage.service";

type GenerateDocumentExportInput = {
  userId: string;
  documentId: string;
  format: ExportFormat;
  options: CreateExportOptions;
};

export type GeneratedDocumentExport = {
  id: string;
  format: ExportFormat;
  fileName: string;
  fileKey: string;
  signedUrl: string;
  downloadUrl: string;
  expiresAt: string;
  warning: string | null;
};

type DownloadDocumentExportInput = {
  userId: string;
  documentId: string;
  exportId: string;
};

export type DownloadedDocumentExport = {
  fileName: string;
  contentType: string;
  data: Buffer;
};

const EXTENSIONS: Record<ExportFormat, string> = {
  docx: "docx",
  pdf: "pdf",
  markdown: "md",
  txt: "txt",
  html: "html",
};

const CONTENT_TYPES: Record<ExportFormat, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  markdown: "text/markdown",
  txt: "text/plain",
  html: "text/html",
};

function sanitizeBaseFileName(title: string): string {
  const fallback = "document";
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (normalized || fallback).slice(0, 80);
}

function getFormattingWarning(format: ExportFormat, fidelityStatus: string) {
  if (format === "txt") {
    return "Plain text exports remove rich formatting.";
  }

  if (format === "pdf" || format === "docx") {
    return "PDF and Word exports may differ slightly from the editable workspace. Your original uploaded file remains preserved.";
  }

  if (
    fidelityStatus === "Limited Formatting" ||
    fidelityStatus === "Plain Text Only" ||
    fidelityStatus === "Formatting Review Needed"
  ) {
    return "Some source formatting may be limited in this export.";
  }

  return null;
}

export async function generateDocumentExport(
  input: GenerateDocumentExportInput,
): Promise<GeneratedDocumentExport | null> {
  const supabase = createSupabaseServerClient();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select(
      "id,title,current_markdown,editor_json,extracted_text,fidelity_status,word_count",
    )
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (documentError) {
    console.error("[export/load-document]", documentError.message);
    throw new Error("Failed to load document for export");
  }

  if (!document) {
    return null;
  }

  const markdown = document.current_markdown ?? document.extracted_text ?? "";
  const rendered = renderExport({
    title: document.title,
    markdown,
    editorJson: document.editor_json,
    format: input.format,
    options: input.options,
    fidelityStatus: document.fidelity_status,
    wordCount: document.word_count,
  });
  const exportId = crypto.randomUUID();
  const extension = EXTENSIONS[input.format];
  const fileName = `${sanitizeBaseFileName(document.title)}.${extension}`;
  const warning = getFormattingWarning(input.format, document.fidelity_status);
  const fileKey = await uploadExportFile(supabase, {
    userId: input.userId,
    documentId: document.id,
    exportId,
    fileName,
    contentType: rendered.contentType,
    data: rendered.data,
  });

  const payload: TablesInsert<"exports"> = {
    id: exportId,
    user_id: input.userId,
    document_id: document.id,
    format: input.format,
    file_key: fileKey,
    status: "completed",
    warning,
  };

  const { data: exportRecord, error: exportError } = await supabase
    .from("exports")
    .insert(payload)
    .select("id")
    .single();

  if (exportError || !exportRecord) {
    await removeExportFile(supabase, fileKey);
    console.error("[export/create-record]", exportError?.message);
    throw new Error("Failed to create export record");
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    documentId: document.id,
    eventType: "export",
    metadata: {
      format: input.format,
      fileKey,
      options: input.options,
      warning,
    },
  });

  const signedUrl = await createSignedExportUrl(supabase, fileKey, fileName);
  const downloadUrl = `/api/documents/${document.id}/export/${exportRecord.id}/download`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  return {
    id: exportRecord.id,
    format: input.format,
    fileName,
    fileKey,
    signedUrl,
    downloadUrl,
    expiresAt,
    warning,
  };
}

export async function downloadDocumentExport(
  input: DownloadDocumentExportInput,
): Promise<DownloadedDocumentExport | null> {
  const supabase = createSupabaseServerClient();

  const { data: exportRecord, error } = await supabase
    .from("exports")
    .select("id,format,file_key")
    .eq("id", input.exportId)
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "completed")
    .maybeSingle();

  if (error) {
    console.error("[export/download-record]", error.message);
    throw new Error("Failed to load export");
  }

  if (!exportRecord?.file_key) {
    return null;
  }

  const format = exportRecord.format as ExportFormat;
  const prefix = `${exportRecord.id}-`;
  const fileName = exportRecord.file_key.split("/").at(-1) ?? "document";
  const downloadName = fileName.startsWith(prefix)
    ? fileName.slice(prefix.length)
    : fileName;

  return {
    fileName: downloadName,
    contentType: CONTENT_TYPES[format] ?? "application/octet-stream",
    data: await downloadExportFile(supabase, exportRecord.file_key),
  };
}
