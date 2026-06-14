import type { ParsedFileType } from "@/lib/parsing/parse-file";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "10 MB";

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".md", ".markdown", ".txt"];

const EXTENSION_TYPE_MAP: Record<string, ParsedFileType> = {
  pdf: "pdf",
  docx: "docx",
  md: "markdown",
  markdown: "markdown",
  txt: "txt",
};

const CONTENT_TYPE_BY_FILE_TYPE: Record<ParsedFileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  markdown: "text/markdown",
  txt: "text/plain",
};

export const FILE_TYPE_TO_DB: Record<ParsedFileType, string> = {
  pdf: "pdf",
  docx: "docx",
  markdown: "markdown",
  txt: "txt",
};

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");

  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
}

export function detectFileType(fileName: string): ParsedFileType | null {
  const extension = getExtension(fileName);

  return EXTENSION_TYPE_MAP[extension] ?? null;
}

export function contentTypeFor(fileType: ParsedFileType): string {
  return CONTENT_TYPE_BY_FILE_TYPE[fileType];
}

// Produces a storage-safe filename: strips paths, keeps a conservative character
// set, collapses repeats, and guarantees a non-empty name.
export function sanitizeStorageFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName;
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 200);

  return cleaned.length > 0 ? cleaned : "upload";
}

// Derives a clean document title from the filename using the same allowlist as
// other title inputs, falling back to a default when nothing valid remains.
export function deriveTitleFromFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName;
  const withoutExt = base.replace(/\.[^.]+$/, "");
  const cleaned = withoutExt
    .replace(/[^\p{L}\p{N} \-_.,'()&]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
    .trim();

  return cleaned.length > 0 ? cleaned : "Untitled Document";
}

export type UploadValidationResult =
  | {
      ok: true;
      fileType: ParsedFileType;
      title: string;
      safeFileName: string;
      contentType: string;
    }
  | { ok: false; error: string };

export function validateUpload(file: {
  name: string;
  size: number;
}): UploadValidationResult {
  if (!file.name || file.size <= 0) {
    return { ok: false, error: "No file was provided." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${MAX_UPLOAD_LABEL}.`,
    };
  }

  const fileType = detectFileType(file.name);

  if (!fileType) {
    return {
      ok: false,
      error: "Unsupported file type. Upload a PDF, DOCX, Markdown, or TXT file.",
    };
  }

  return {
    ok: true,
    fileType,
    title: deriveTitleFromFileName(file.name),
    safeFileName: sanitizeStorageFileName(file.name),
    contentType: contentTypeFor(fileType),
  };
}
