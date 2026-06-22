import { describe, expect, it } from "vitest";

import {
  DEFAULT_GEMINI_MODEL,
  getGeminiGenerateConfig,
  getGeminiModelCandidates,
} from "@/lib/ai/providers/gemini.provider";

describe("Gemini provider performance configuration", () => {
  it("uses the low-latency stable model with a capacity fallback", () => {
    expect(DEFAULT_GEMINI_MODEL).toBe("gemini-2.5-flash-lite");
    expect(getGeminiModelCandidates()).toEqual([
      "gemini-2.5-flash-lite",
      "gemini-3.1-flash-lite",
    ]);
  });

  it("does not replace an explicitly requested model", () => {
    expect(getGeminiModelCandidates("gemini-2.5-flash")).toEqual([
      "gemini-2.5-flash",
    ]);
  });

  it("disables thinking for Gemini 2.5 document transformations", () => {
    expect(getGeminiGenerateConfig("gemini-2.5-flash-lite")).toMatchObject({
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        required: expect.arrayContaining([
          "mode",
          "revisedMarkdown",
          "suggestions",
          "analysis",
        ]),
      },
    });
  });

  it("does not send the 2.5 thinking budget to newer models", () => {
    expect(getGeminiGenerateConfig("gemini-3.1-flash-lite")).not.toHaveProperty(
      "thinkingConfig",
    );
  });
});
