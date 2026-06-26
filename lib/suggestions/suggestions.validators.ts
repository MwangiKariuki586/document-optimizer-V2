import { z } from "zod";

import {
  DOCUMENT_CONTENT_MAX,
  documentIdParamSchema,
} from "@/lib/documents/document.validators";

export const suggestionTypeSchema = z.enum([
  "clarity",
  "conciseness",
  "formatting",
  "grammar",
  "tone",
  "structure",
  "seo",
  "style",
]);

export const suggestionStatusSchema = z.enum([
  "pending",
  "applied",
  "ignored",
]);

export const suggestionIdParamSchema = z.object({
  suggestionId: z.string().uuid("Invalid suggestion id"),
});

export const suggestionRouteParamsSchema = documentIdParamSchema.extend({
  suggestionId: z.string().uuid("Invalid suggestion id"),
});

export const suggestionPreviewSearchParamsSchema = z
  .object({
    requestId: z.string().uuid("Invalid AI request id").optional(),
    suggestionId: z.string().uuid("Invalid suggestion id").optional(),
    selectionId: z.string().uuid("Invalid selection id").optional(),
    applied: z.literal("1").optional(),
  })
  .refine(
    (value) =>
      [
        value.requestId,
        value.suggestionId,
        value.selectionId,
        value.applied,
      ].filter(Boolean).length === 1,
    "Choose exactly one preview source",
  );

export const createSuggestionSelectionSchema = z
  .object({
    suggestionIds: z
      .array(z.string().uuid("Invalid suggestion id"))
      .min(1, "Select at least one suggestion")
      .max(100, "Select fewer suggestions"),
  })
  .strict();

export const selectionIdParamSchema = z.object({
  selectionId: z.string().uuid("Invalid selection id"),
});

export const selectionRouteParamsSchema = documentIdParamSchema.extend({
  selectionId: z.string().uuid("Invalid selection id"),
});

export const applyEditedResultSchema = z
  .object({
    editedMarkdown: z
      .string()
      .trim()
      .min(1, "Edited result cannot be empty")
      .max(
        DOCUMENT_CONTENT_MAX,
        `Edited result must be ${DOCUMENT_CONTENT_MAX.toLocaleString("en-US")} characters or fewer`,
      )
      .optional(),
  })
  .strict();
