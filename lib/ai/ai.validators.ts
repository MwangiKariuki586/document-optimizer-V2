import { z } from "zod";

import {
  DOCUMENT_CONTENT_MAX,
  documentIdParamSchema,
} from "@/lib/documents/document.validators";

export const AI_CONTENT_MAX = DOCUMENT_CONTENT_MAX;

export const aiActionSchema = z.enum([
  "optimize",
  "improve_clarity",
  "fix_grammar",
  "rewrite",
  "summarize",
  "translate",
  "tone_analyze",
  "seo_analyze",
  "simplify_language",
]);

export const aiProviderSchema = z.enum(["openai", "gemini", "deepseek"]);

export const aiRequestRouteParamsSchema = documentIdParamSchema.extend({
  requestId: z.string().uuid("Invalid AI request id."),
});

export const aiToneSchema = z.enum([
  "professional",
  "friendly",
  "confident",
  "formal",
]);

export const aiAudienceSchema = z.enum([
  "general",
  "executive",
  "technical",
  "customer",
]);

export const aiLanguageSchema = z.enum(["en", "es", "fr", "de"]);

export const aiActionOptionsSchema = z.object({
  tone: aiToneSchema.default("professional"),
  audience: aiAudienceSchema.default("general"),
  language: aiLanguageSchema.default("en"),
  preserveStructure: z.boolean().default(true),
});

const DEFAULT_AI_ACTION_OPTIONS = {
  tone: "professional",
  audience: "general",
  language: "en",
  preserveStructure: true,
} as const;

export const aiActionInputSchema = z.object({
  action: aiActionSchema,
  title: z.string().trim().max(120).optional(),
  contentMarkdown: z
    .string({ message: "Document content is required" })
    .trim()
    .min(1, "Document content is required")
    .max(
      AI_CONTENT_MAX,
      `Document content must be ${AI_CONTENT_MAX.toLocaleString("en-US")} characters or fewer`,
    ),
  options: aiActionOptionsSchema.default(DEFAULT_AI_ACTION_OPTIONS),
  provider: aiProviderSchema.optional(),
  model: z.string().trim().min(1).max(100).optional(),
});

export const runAIActionRequestSchema = z.object({
  action: aiActionSchema,
  contentMarkdown: z
    .string({ message: "Document content is required" })
    .trim()
    .min(1, "Document content is required")
    .max(
      AI_CONTENT_MAX,
      `Document content must be ${AI_CONTENT_MAX.toLocaleString("en-US")} characters or fewer`,
    ),
  options: aiActionOptionsSchema.default(DEFAULT_AI_ACTION_OPTIONS),
  provider: aiProviderSchema.optional(),
  model: z.string().trim().min(1).max(100).optional(),
});

export const aiSuggestionOutputSchema = z.object({
  type: z.enum([
    "grammar",
    "clarity",
    "tone",
    "conciseness",
    "structure",
    "formatting",
  ]),
  originalText: z.string().trim().min(1),
  suggestedText: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
});

export const aiAnalysisOutputSchema = z
  .object({
    clarity: z.number().int().min(0).max(100).optional(),
    tone: z.number().int().min(0).max(100).optional(),
    structure: z.number().int().min(0).max(100).optional(),
    seo: z.number().int().min(0).max(100).optional(),
    notes: z.array(z.string().trim().min(1)).default([]),
  })
  .default({ notes: [] });

export const aiActionOutputSchema = z.object({
  mode: z.enum(["preview", "suggestions", "analysis"]),
  summary: z.string().trim().min(1),
  revisedMarkdown: z.string().nullable().default(null),
  suggestions: z.array(aiSuggestionOutputSchema).default([]),
  analysis: aiAnalysisOutputSchema,
  warnings: z.array(z.string().trim().min(1)).default([]),
});

export function parseAIActionInput(input: unknown) {
  return aiActionInputSchema.safeParse(input);
}

export function parseAIActionOutput(input: unknown) {
  return aiActionOutputSchema.safeParse(input);
}
