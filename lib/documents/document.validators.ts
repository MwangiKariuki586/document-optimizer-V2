import { z } from "zod";

// Allowlist: letters (any language), numbers, spaces, and a small set of safe
// punctuation. Anything else (control chars, <>{}[]/\|`~@#$%^*=;:"? etc.) is rejected.
export const TITLE_ALLOWED_PATTERN = /^[\p{L}\p{N} \-_.,'()&]+$/u;

export const TITLE_ALLOWED_MESSAGE =
  "Title can only contain letters, numbers, spaces, and - _ . , ' ( ) &";

export const documentTitleSchema = z
  .string({ message: "Document title is required" })
  .trim()
  .min(1, "Document title is required")
  .max(120, "Document title must be 120 characters or fewer")
  .regex(TITLE_ALLOWED_PATTERN, TITLE_ALLOWED_MESSAGE);

// Document body content is large free-text, so no character allowlist applies
// (only titles/names/labels use the allowlist). Stored via the parameterized
// Supabase client, so it is safe from SQL injection.
export const DOCUMENT_CONTENT_MAX = 100_000;

export const documentContentSchema = z
  .string({ message: "Content is required" })
  .trim()
  .min(1, "Content is required")
  .max(
    DOCUMENT_CONTENT_MAX,
    `Content must be ${DOCUMENT_CONTENT_MAX.toLocaleString("en-US")} characters or fewer`,
  );

export const createBlankDocumentSchema = z.object({
  sourceType: z.literal("blank").optional(),
  title: documentTitleSchema,
});

export const createPasteDocumentSchema = z.object({
  sourceType: z.literal("paste"),
  title: documentTitleSchema,
  content: documentContentSchema,
});

export type CreateBlankDocumentRequest = z.infer<
  typeof createBlankDocumentSchema
>;

export type CreatePasteDocumentRequest = z.infer<
  typeof createPasteDocumentSchema
>;

export function isValidDocumentTitle(value: string): boolean {
  return documentTitleSchema.safeParse(value).success;
}
