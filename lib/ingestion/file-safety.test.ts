import { describe, expect, it } from "vitest";
import { detectMimeType, PermanentIngestionError, validateParsedDocument } from "@/lib/ingestion/file-safety";

describe("worker file safety", () => {
  it("validates file signatures independently from filenames", () => {
    expect(detectMimeType("pdf", Buffer.from("%PDF-1.7"))).toBe("application/pdf");
    expect(() => detectMimeType("pdf", Buffer.from("not pdf"))).toThrow(PermanentIngestionError);
  });

  it("rejects extracted content above the processing ceiling", () => {
    expect(() => validateParsedDocument({
      extractedText: "a".repeat(500_001),
      currentMarkdown: "",
      editorJson: { type: "doc", content: [] },
      formattingMetadata: {},
      wordCount: 1,
      fidelityStatus: "Plain Text Only",
      warnings: [],
    })).toThrow("500,000 characters");
  });
});
