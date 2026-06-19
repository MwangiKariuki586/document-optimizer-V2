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

// Editor body content may be empty after manual editing, but is still capped.
export const documentBodySchema = z
  .string({ message: "Content is required" })
  .max(
    DOCUMENT_CONTENT_MAX,
    `Content must be ${DOCUMENT_CONTENT_MAX.toLocaleString("en-US")} characters or fewer`,
  );

// TipTap document JSON. Kept permissive (passthrough) but must be a `doc` root so
// malformed payloads are rejected before they reach the database.
export const editorJsonSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const updateDocumentSchema = z.object({
  title: documentTitleSchema,
  editorJson: editorJsonSchema,
  currentMarkdown: documentBodySchema,
});

export type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>;

export const documentIdParamSchema = z.object({
  id: z.string().uuid("Invalid document id."),
});

// Optional free-text note attached to a manual version snapshot. Capped; no
// character allowlist (free text, stored via the parameterized Supabase client).
export const VERSION_NOTES_MAX = 280;

export const versionNotesSchema = z
  .string()
  .trim()
  .max(
    VERSION_NOTES_MAX,
    `Notes must be ${VERSION_NOTES_MAX} characters or fewer`,
  )
  .optional();

// Manual version snapshot: persists the current editor content and stores a
// recoverable copy. Mirrors the save payload plus an optional note.
export const createVersionSchema = z.object({
  title: documentTitleSchema,
  editorJson: editorJsonSchema,
  currentMarkdown: documentBodySchema,
  notes: versionNotesSchema,
});

export type CreateVersionRequest = z.infer<typeof createVersionSchema>;

export const createPasteDocumentSchema = z.object({
  sourceType: z.literal("paste"),
  title: documentTitleSchema,
  content: documentContentSchema,
});

export type CreatePasteDocumentRequest = z.infer<
  typeof createPasteDocumentSchema
>;

export function isValidDocumentTitle(value: string): boolean {
  return documentTitleSchema.safeParse(value).success;
}
