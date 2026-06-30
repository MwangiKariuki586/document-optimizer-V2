import { describe, expect, it } from "vitest";

import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";
import { AIProviderError, type AIActionInput } from "@/lib/ai/ai.types";

const input: AIActionInput = {
  action: "improve_readability",
  contentMarkdown: "Document content",
  options: {
    tone: "professional",
    audience: "general",
    language: "en",
    preserveStructure: true,
  },
};

describe("normalizeProviderResponse", () => {
  it("normalizes valid provider JSON", () => {
    const result = normalizeProviderResponse({
      input,
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 1000,
      outputTokens: 500,
      text: JSON.stringify({
        mode: "preview",
        summary: "Improved the document.",
        revisedMarkdown: "Improved content",
        suggestions: [],
        analysis: { notes: ["Clearer phrasing"] },
        warnings: [],
      }),
    });

    expect(result.action).toBe("improve_readability");
    expect(result.provider).toBe("openai");
    expect(result.mode).toBe("preview");
    expect(result.output.workflow).toBe("result_preview");
    expect(result.estimatedCost).toBeGreaterThan(0);
  });

  it("throws a safe provider error for invalid JSON", () => {
    expect(() =>
      normalizeProviderResponse({
        input,
        provider: "gemini",
        model: "gemini-2.0-flash",
        text: "not json",
      }),
    ).toThrow(AIProviderError);
  });

  it("normalizes nullable optional fields from provider JSON", () => {
    const result = normalizeProviderResponse({
      input,
      provider: "deepseek",
      model: "deepseek-v4-flash",
      text: JSON.stringify({
        mode: "suggestions",
        summary: "Suggested clearer phrasing.",
        revisedMarkdown: null,
        suggestions: null,
        analysis: null,
        warnings: null,
      }),
    });

    expect(result.output.analysis).toEqual({ notes: [] });
    expect(result.output.suggestions).toEqual([]);
    expect(result.output.warnings).toEqual([]);
    expect(result.output.workflow).toBe("inline_suggestions");
  });

  it("ignores irrelevant result metadata for inline actions", () => {
    const result = normalizeProviderResponse({
      input: {
        ...input,
        action: "proofread_correct",
      },
      provider: "deepseek",
      model: "deepseek-v4-flash",
      text: JSON.stringify({
        mode: "suggestions",
        workflow: "inline_suggestions",
        resultMode: "not-applicable",
        structureChangeLevel: "not-applicable",
        targetLanguage: "not-a-supported-language",
        summary: "Found one correction.",
        revisedMarkdown: null,
        suggestions: [
          {
            type: "grammar",
            originalText: "PostgresSQL",
            suggestedText: "PostgreSQL",
            explanation: "Corrects the product name.",
          },
        ],
        analysis: { notes: [] },
        warnings: [],
      }),
    });

    expect(result.output.targetLanguage).toBeUndefined();
    expect(result.output.resultMode).toBeUndefined();
    expect(result.output.structureChangeLevel).toBeUndefined();
    expect(result.output.suggestions).toHaveLength(1);
  });
});
