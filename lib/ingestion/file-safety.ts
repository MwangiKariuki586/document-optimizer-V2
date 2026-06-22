import { fromBuffer } from "yauzl";
import {
  MAX_DOCX_ENTRIES,
  MAX_DOCX_UNCOMPRESSED_BYTES,
  MAX_EDITOR_NODES,
  MAX_EXTRACTED_CHARACTERS,
  MAX_PDF_PAGES,
} from "@/lib/ingestion/ingestion.validators";
import type { ParsedDocument, ParsedFileType } from "@/lib/parsing/parse-file";

export class PermanentIngestionError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

export function detectMimeType(type: ParsedFileType, data: Buffer): string {
  if (type === "pdf") {
    if (data.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new PermanentIngestionError("invalid_signature", "This file is not a valid PDF.");
    }
    return "application/pdf";
  }
  if (type === "docx") {
    if (data[0] !== 0x50 || data[1] !== 0x4b) {
      throw new PermanentIngestionError("invalid_signature", "This file is not a valid DOCX.");
    }
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return type === "markdown" ? "text/markdown" : "text/plain";
}

export async function validateDocxArchive(data: Buffer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    fromBuffer(data, { lazyEntries: true }, (error, zip) => {
      if (error || !zip) {
        reject(new PermanentIngestionError("invalid_docx", "This DOCX archive could not be read."));
        return;
      }
      let entries = 0;
      let uncompressed = 0;
      let hasDocument = false;
      zip.readEntry();
      zip.on("entry", (entry) => {
        entries += 1;
        uncompressed += entry.uncompressedSize;
        if (entry.fileName === "word/document.xml") hasDocument = true;
        if (entries > MAX_DOCX_ENTRIES || uncompressed > MAX_DOCX_UNCOMPRESSED_BYTES) {
          zip.close();
          reject(new PermanentIngestionError("docx_too_complex", "This DOCX is too complex to process safely."));
          return;
        }
        zip.readEntry();
      });
      zip.on("end", () => {
        if (!hasDocument) {
          reject(new PermanentIngestionError("invalid_docx", "This file does not contain a DOCX document."));
          return;
        }
        resolve();
      });
      zip.on("error", () => reject(new PermanentIngestionError("invalid_docx", "This DOCX archive could not be read.")));
    });
  });
}

export function validateParsedDocument(parsed: ParsedDocument): void {
  if (parsed.extractedText.length > MAX_EXTRACTED_CHARACTERS) {
    throw new PermanentIngestionError("text_too_large", "The extracted document exceeds 500,000 characters.");
  }
  const editor = parsed.editorJson as { content?: unknown[] } | null;
  if ((editor?.content?.length ?? 0) > MAX_EDITOR_NODES) {
    throw new PermanentIngestionError("document_too_complex", "The document contains too many editable blocks.");
  }
  const pageCount = Number(parsed.formattingMetadata?.pageCount ?? 0);
  if (pageCount > MAX_PDF_PAGES) {
    throw new PermanentIngestionError("pdf_too_long", "PDF documents are limited to 500 pages.");
  }
}
