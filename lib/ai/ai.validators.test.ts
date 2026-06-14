import { describe, expect, it } from "vitest";

import {
  aiActionInputSchema,
  aiActionOutputSchema,
  runAIActionRequestSchema,
} from "@/lib/ai/ai.validators";

describe("aiActionInputSchema", () => {
  it("parses action input with default options", () => {
    const result = aiActionInputSchema.safeParse({
      action: "optimize",
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
});

describe("runAIActionRequestSchema", () => {
  it("validates route payloads with action options", () => {
    const result = runAIActionRequestSchema.safeParse({
      action: "rewrite",
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

  it("rejects empty document content", () => {
    const result = runAIActionRequestSchema.safeParse({
      action: "rewrite",
      contentMarkdown: "",
    });

    expect(result.success).toBe(false);
  });
});
