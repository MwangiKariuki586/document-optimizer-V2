import { describe, expect, it } from "vitest";

import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";
import { AIProviderError, type AIActionInput } from "@/lib/ai/ai.types";

const input: AIActionInput = {
  action: "improve_clarity",
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

    expect(result.action).toBe("improve_clarity");
    expect(result.provider).toBe("openai");
    expect(result.mode).toBe("preview");
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
});
