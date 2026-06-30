import { describe, expect, it } from "vitest";

import {
  aiActionInputSchema,
  aiActionOutputSchema,
  runAIActionRequestSchema,
} from "@/lib/ai/ai.validators";

describe("aiActionInputSchema", () => {
  it("parses action input with default options", () => {
    const result = aiActionInputSchema.safeParse({
      action: "improvement_scan",
      contentMarkdown: "## Plan\n\nImprove this document.",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.options).toEqual({
        tone: "professional",
        audience: "general",
        language: "en",
        preserveStructure: true,
      });
    }
  });

  it("rejects unsupported actions", () => {
    const result = aiActionInputSchema.safeParse({
      action: "auto_apply",
      contentMarkdown: "Document content",
    });

    expect(result.success).toBe(false);
  });
});

describe("aiActionOutputSchema", () => {
  it("parses normalized preview output", () => {
    const result = aiActionOutputSchema.safeParse({
      mode: "preview",
      summary: "Improved clarity and tone.",
      revisedMarkdown: "Improved markdown",
      suggestions: [],
      analysis: { notes: ["Structure preserved"] },
      warnings: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects output without a summary", () => {
    const result = aiActionOutputSchema.safeParse({
      mode: "analysis",
      suggestions: [],
      analysis: { notes: [] },
      warnings: [],
    });

    expect(result.success).toBe(false);
  });

  it("accepts structured suggestions that use category and reason", () => {
    const result = aiActionOutputSchema.safeParse({
      mode: "suggestions",
      workflow: "inline_suggestions",
      summary: "Found one readability issue.",
      revisedMarkdown: null,
      suggestions: [
        {
          id: "readability-1",
          actionType: "improve_readability",
          category: "clarity",
          issueLabel: "Complex phrasing",
          originalText: "utilize the available functionality",
          suggestedText: "use the available feature",
          reason: "Uses simpler wording while preserving meaning.",
          severity: "low",
          location: { startOffset: 12, endOffset: 47, blockId: null },
        },
      ],
      analysis: null,
      warnings: null,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.suggestions[0]).toMatchObject({
        type: "clarity",
        category: "clarity",
        explanation: "Uses simpler wording while preserving meaning.",
        reason: "Uses simpler wording while preserving meaning.",
        location: { startOffset: 12, endOffset: 47 },
      });
    }
  });

  it("accepts null optional metadata from provider output", () => {
    const result = aiActionOutputSchema.safeParse({
      mode: "suggestions",
      workflow: null,
      resultMode: null,
      structureChangeLevel: null,
      targetLanguage: null,
      summary: "Found one issue.",
      revisedMarkdown: null,
      suggestions: [
        {
          id: null,
          actionType: null,
          type: "grammar",
          category: null,
          issueLabel: null,
          originalText: "PostgresSQL",
          suggestedText: "PostgreSQL",
          explanation: "Corrects the product name.",
          reason: null,
          severity: null,
          location: {
            startOffset: null,
            endOffset: null,
            blockId: null,
          },
        },
      ],
      analysis: {
        clarity: null,
        tone: null,
        structure: null,
        seo: null,
        notes: [],
      },
      warnings: null,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.workflow).toBeUndefined();
      expect(result.data.suggestions[0].severity).toBeUndefined();
      expect(result.data.suggestions[0].location).toEqual({});
      expect(result.data.analysis).toEqual({ notes: [] });
    }
  });
});

describe("runAIActionRequestSchema", () => {
  it("validates route payloads with action options", () => {
    const result = runAIActionRequestSchema.safeParse({
      action: "improve_readability",
      contentMarkdown: "Rewrite this document.",
      options: {
        tone: "friendly",
        audience: "customer",
        language: "en",
        preserveStructure: true,
      },
    });

    expect(result.success).toBe(true);
  });

  it("validates route payloads with action-specific options", () => {
    const result = runAIActionRequestSchema.safeParse({
      action: "translate_document",
      contentMarkdown: "Rewrite this document.",
      options: {
        tone: "professional",
        audience: "customer",
        language: "en",
        preserveStructure: true,
        targetLanguage: "sw",
        translationStyle: "natural",
        termsToPreserve: "Docufine",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty document content", () => {
    const result = runAIActionRequestSchema.safeParse({
      action: "summarize_shorten",
      contentMarkdown: "",
    });

    expect(result.success).toBe(false);
  });
});
