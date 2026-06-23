import { describe, expect, it } from "vitest";

import { estimateAICost } from "@/lib/ai/ai-cost";

describe("estimateAICost", () => {
  it("estimates configured model costs", () => {
    const cost = estimateAICost({
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 1_000_000,
      outputTokens: 500_000,
    });

    expect(cost).toBe(0.45);
  });

  it("returns undefined when token usage is missing", () => {
    const cost = estimateAICost({
      provider: "gemini",
      model: "gemini-2.0-flash",
    });

    expect(cost).toBeUndefined();
  });

  it("estimates the low-latency Gemini model cost", () => {
    const cost = estimateAICost({
      provider: "gemini",
      model: "gemini-2.5-flash-lite",
      inputTokens: 1_000_000,
      outputTokens: 500_000,
    });

    expect(cost).toBe(0.3);
  });

  it("returns undefined for unknown model pricing", () => {
    const cost = estimateAICost({
      provider: "openai",
      model: "custom-model",
      inputTokens: 100,
      outputTokens: 100,
    });

    expect(cost).toBeUndefined();
  });

  it("estimates DeepSeek V4 Flash cost", () => {
    const cost = estimateAICost({
      provider: "deepseek",
      model: "deepseek-v4-flash",
      inputTokens: 1_000_000,
      outputTokens: 500_000,
    });

    expect(cost).toBe(0.28);
  });
});
