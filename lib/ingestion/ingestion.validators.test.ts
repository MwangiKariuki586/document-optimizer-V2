import { describe, expect, it } from "vitest";
import { initializeUploadSchema } from "@/lib/ingestion/ingestion.validators";
import { createPasteDocumentSchema } from "@/lib/documents/document.validators";

describe("ingestion validation", () => {
  it("accepts a valid SHA-256 upload initialization", () => {
    expect(initializeUploadSchema.safeParse({
      name: "report.pdf",
      size: 1024,
      mimeType: "application/pdf",
      checksumSha256: "a".repeat(64),
      idempotencyKey: "fcb52217-f086-4a35-9274-bf35f6236f44",
    }).success).toBe(true);
  });

  it("rejects malformed checksums", () => {
    expect(initializeUploadSchema.safeParse({
      name: "report.pdf",
      size: 1024,
      mimeType: "application/pdf",
      checksumSha256: "not-a-checksum",
      idempotencyKey: "fcb52217-f086-4a35-9274-bf35f6236f44",
    }).success).toBe(false);
  });

  it("bounds pasted editor nodes by line count", () => {
    expect(createPasteDocumentSchema.safeParse({
      sourceType: "paste",
      title: "Many Lines",
      content: Array.from({ length: 20_001 }, () => "x").join("\n"),
    }).success).toBe(false);
  });
});

