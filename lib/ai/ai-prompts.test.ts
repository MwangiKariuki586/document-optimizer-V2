import { describe, expect, it } from "vitest";

import { buildAIUserPrompt } from "@/lib/ai/ai-prompts";
import type { AIActionInput } from "@/lib/ai/ai.types";

const baseInput: AIActionInput = {
  action: "summarize_shorten",
  title: "Job Post",
  contentMarkdown: "Back-End Software Engineer role in Nairobi.",
  options: {
    tone: "professional",
    audience: "general",
    language: "en",
    preserveStructure: true,
    summaryOutputType: "executive_summary",
    summaryLength: "brief",
    targetLanguage: "sw",
    translationStyle: "natural",
    termsToPreserve: "Identigate",
  },
};

describe("buildAIUserPrompt", () => {
  it("does not leak translation settings into summarize and shorten prompts", () => {
    const prompt = buildAIUserPrompt(baseInput);

    expect(prompt).toContain("Action: summarize_shorten");
    expect(prompt).toContain("Summary output type: executive_summary");
    expect(prompt).toContain("Summary length: brief");
    expect(prompt).toContain("Output language: English");
    expect(prompt).toContain("Do not translate the document.");
    expect(prompt).not.toContain("Target language: Swahili");
    expect(prompt).not.toContain("Translation style:");
    expect(prompt).not.toContain("Terms to preserve:");
  });

  it("includes translation settings only for translate document prompts", () => {
    const prompt = buildAIUserPrompt({
      ...baseInput,
      action: "translate_document",
    });

    expect(prompt).toContain("Action: translate_document");
    expect(prompt).toContain("Target language: Swahili");
    expect(prompt).toContain("Translation style: natural");
    expect(prompt).toContain("Terms to preserve: Identigate");
    expect(prompt).not.toContain("Do not translate the document.");
  });
});
