import { describe, expect, it } from "vitest";

import {
  MAX_UPLOAD_BYTES,
  deriveTitleFromFileName,
  sanitizeStorageFileName,
  validateUpload,
} from "@/lib/documents/upload.validators";

describe("validateUpload", () => {
  it.each([
    ["resume.pdf", "pdf", "application/pdf"],
    [
      "brief.docx",
      "docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ["notes.md", "markdown", "text/markdown"],
    ["draft.markdown", "markdown", "text/markdown"],
    ["plain.txt", "txt", "text/plain"],
  ])("accepts supported MVP file %s", (name, fileType, contentType) => {
    const result = validateUpload({ name, size: 1024 });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        fileType,
        contentType,
      }),
    );
  });

  it("rejects missing, oversized, and unsupported files", () => {
    expect(validateUpload({ name: "", size: 0 })).toEqual({
      ok: false,
      error: "No file was provided.",
    });
    expect(validateUpload({ name: "large.pdf", size: MAX_UPLOAD_BYTES + 1 })).toEqual({
      ok: false,
      error: "File is too large. Maximum size is 10 MB.",
    });
    expect(validateUpload({ name: "archive.zip", size: 1024 })).toEqual({
      ok: false,
      error: "Unsupported file type. Upload a PDF, DOCX, Markdown, or TXT file.",
    });
  });
});

describe("upload filename helpers", () => {
  it("sanitizes storage filenames without preserving path segments", () => {
    expect(sanitizeStorageFileName("../unsafe folder/My File!.pdf")).toBe(
      "My-File-.pdf",
    );
  });

  it("derives a safe document title from uploaded filenames", () => {
    expect(deriveTitleFromFileName("Q2 <Plan> & Notes.md")).toBe(
      "Q2 Plan & Notes",
    );
  });
});
