import { z } from "zod";

import {
  DOCUMENT_CONTENT_MAX,
  documentIdParamSchema,
} from "@/lib/documents/document.validators";

export const AI_CONTENT_MAX = DOCUMENT_CONTENT_MAX;

export const aiActionSchema = z.enum([
  "improvement_scan",
  "proofread_correct",
  "improve_readability",
  "tone_alignment",
  "structure_flow",
  "summarize_shorten",
  "translate_document",
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
  "concise",
  "persuasive",
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

export const aiTranslationLanguageSchema = z.enum([
  "en",
  "sw",
  "fr",
  "es",
  "de",
  "it",
  "pt",
  "nl",
  "ar",
  "hi",
  "zh-CN",
  "ja",
  "ko",
  "tr",
  "ru",
  "pl",
  "uk",
  "id",
  "ms",
  "vi",
  "th",
  "fil",
]);

export const aiSummaryOutputTypeSchema = z.enum([
  "short_summary",
  "bullet_summary",
  "executive_summary",
  "shortened_version",
]);

export const aiSummaryLengthSchema = z.enum(["brief", "medium", "detailed"]);

export const aiTranslationStyleSchema = z.enum([
  "natural",
  "professional",
  "formal",
  "simple",
]);

export const aiWorkflowSchema = z.enum([
  "inline_suggestions",
  "result_preview",
]);

export const aiResultModeSchema = z.enum([
  "optimization",
  "summary",
  "translation",
]);

export const aiStructureChangeLevelSchema = z.enum(["minor", "major"]);

export const aiActionOptionsSchema = z.object({
  tone: aiToneSchema.default("professional"),
  audience: aiAudienceSchema.default("general"),
  language: aiLanguageSchema.default("en"),
  preserveStructure: z.boolean().default(true),
  toneTarget: aiToneSchema.optional(),
  audienceOrPurpose: z.string().trim().max(300).optional(),
  summaryOutputType: aiSummaryOutputTypeSchema.optional(),
  summaryLength: aiSummaryLengthSchema.optional(),
  targetLanguage: aiTranslationLanguageSchema.optional(),
  translationStyle: aiTranslationStyleSchema.optional(),
  termsToPreserve: z.string().trim().max(500).optional(),
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

const aiSuggestionCategorySchema = z.enum([
  "grammar",
  "clarity",
  "tone",
  "conciseness",
  "structure",
  "formatting",
]);

export const aiSuggestionOutputSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const suggestion = value as Record<string, unknown>;
  const location =
    suggestion.location && typeof suggestion.location === "object" && !Array.isArray(suggestion.location)
      ? Object.fromEntries(
          Object.entries(suggestion.location as Record<string, unknown>).filter(
            ([, locationValue]) => locationValue !== null && locationValue !== undefined,
          ),
        )
      : suggestion.location;

  return {
    ...suggestion,
    type: suggestion.type ?? suggestion.category,
    category: suggestion.category ?? suggestion.type,
    explanation: suggestion.explanation ?? suggestion.reason,
    reason: suggestion.reason ?? suggestion.explanation,
    location,
  };
}, z.object({
  id: z.string().trim().min(1).optional(),
  actionType: z
    .enum([
      "improvement_scan",
      "proofread_correct",
      "improve_readability",
      "tone_alignment",
      "structure_flow",
    ])
    .optional(),
  type: aiSuggestionCategorySchema,
  category: aiSuggestionCategorySchema.optional(),
  issueLabel: z.string().trim().min(1).optional(),
  originalText: z.string().trim().min(1),
  suggestedText: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  reason: z.string().trim().min(1).optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  location: z
    .object({
      startOffset: z.number().int().min(0).optional(),
      endOffset: z.number().int().min(0).optional(),
      blockId: z.string().trim().min(1).optional(),
    })
    .optional(),
}));

export const aiAnalysisOutputSchema = z
  .object({
    clarity: z.number().int().min(0).max(100).optional(),
    tone: z.number().int().min(0).max(100).optional(),
    structure: z.number().int().min(0).max(100).optional(),
    seo: z.number().int().min(0).max(100).optional(),
    notes: z.array(z.string().trim().min(1)).default([]),
  })
  .default({ notes: [] });

const nullableDefaultArray = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === null ? undefined : value), schema);

export const aiActionOutputSchema = z.object({
  mode: z.enum(["preview", "suggestions", "analysis"]),
  workflow: aiWorkflowSchema.optional(),
  resultMode: aiResultModeSchema.optional(),
  structureChangeLevel: aiStructureChangeLevelSchema.optional(),
  targetLanguage: aiTranslationLanguageSchema.optional(),
  summary: z.string().trim().min(1),
  revisedMarkdown: z.string().nullable().default(null),
  suggestions: nullableDefaultArray(z.array(aiSuggestionOutputSchema).default([])),
  analysis: z.preprocess(
    (value) => (value === null ? undefined : value),
    aiAnalysisOutputSchema,
  ),
  warnings: nullableDefaultArray(z.array(z.string().trim().min(1)).default([])),
});

export function parseAIActionInput(input: unknown) {
  return aiActionInputSchema.safeParse(input);
}

export function parseAIActionOutput(input: unknown) {
  return aiActionOutputSchema.safeParse(input);
}
