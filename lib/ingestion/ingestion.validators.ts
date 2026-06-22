import { z } from "zod";
import { uploadFileMetadataSchema } from "@/lib/documents/upload.validators";

export const MAX_EXTRACTED_CHARACTERS = 500_000;
export const MAX_EDITOR_NODES = 20_000;
export const MAX_PDF_PAGES = 500;
export const MAX_DOCX_ENTRIES = 2_000;
export const MAX_DOCX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;
export const PROCESSING_TIMEOUT_MS = 120_000;

export const checksumSchema = z
  .string()
  .regex(/^[0-9a-f]{64}$/, "Invalid SHA-256 checksum.");

export const initializeUploadSchema = uploadFileMetadataSchema.safeExtend({
  mimeType: z.string().trim().min(1).max(200),
  checksumSha256: checksumSchema,
  idempotencyKey: z.uuid(),
  duplicateDecision: z.literal("continue_as_new").optional(),
});

export const duplicateResolutionSchema = z.object({
  action: z.enum(["open_existing", "continue_as_new"]),
});

export const ingestionIdParamSchema = z.object({
  ingestionId: z.uuid(),
});

export const ingestionDocumentParamSchema = z.object({
  documentId: z.uuid(),
});
