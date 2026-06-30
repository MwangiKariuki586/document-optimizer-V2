import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAIAction, selectAIProvider } from "@/lib/ai/ai-router";
import type { AIActionInput } from "@/lib/ai/ai.types";

const baseInput: AIActionInput = {
  action: "improvement_scan",
  contentMarkdown: "Document content",
  options: {
    tone: "professional",
    audience: "general",
    language: "en",
    preserveStructure: true,
  },
};

const originalOpenAIKey = process.env.OPENAI_API_KEY;
const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalDeepSeekKey = process.env.DEEPSEEK_API_KEY;

function restoreEnvVar(
  key: "OPENAI_API_KEY" | "GEMINI_API_KEY" | "DEEPSEEK_API_KEY",
  value?: string,
) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
});

afterEach(() => {
  restoreEnvVar("OPENAI_API_KEY", originalOpenAIKey);
  restoreEnvVar("GEMINI_API_KEY", originalGeminiKey);
  restoreEnvVar("DEEPSEEK_API_KEY", originalDeepSeekKey);
});

describe("selectAIProvider", () => {
  it("uses the explicitly requested provider", () => {
    const provider = selectAIProvider({ ...baseInput, provider: "deepseek" });

    expect(provider.name).toBe("deepseek");
  });

  it("keeps Gemini available when explicitly requested", () => {
    const provider = selectAIProvider({ ...baseInput, provider: "gemini" });

    expect(provider.name).toBe("gemini");
  });

  it("uses explicitly requested OpenAI only as a future provider path", () => {
    const provider = selectAIProvider({ ...baseInput, provider: "openai" });

    expect(provider.name).toBe("openai");
  });

  it("prefers DeepSeek even when other provider keys are configured", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";

    const provider = selectAIProvider(baseInput);

    expect(provider.name).toBe("deepseek");
  });

  it("defaults to DeepSeek when no provider is explicitly requested", () => {
    const provider = selectAIProvider(baseInput);

    expect(provider.name).toBe("deepseek");
  });
});

describe("runAIAction", () => {
  it("rejects invalid input before provider execution", async () => {
    await expect(runAIAction({ action: "bad" })).rejects.toThrow(
      "Invalid AI action input",
    );
  });

  it("fails clearly when the default DeepSeek provider is not configured", async () => {
    await expect(runAIAction(baseInput)).rejects.toThrow(
      "DeepSeek is not configured",
    );
  });

  it("fails clearly when OpenAI is explicitly requested during MVP", async () => {
    await expect(
      runAIAction({ ...baseInput, provider: "openai" }),
    ).rejects.toThrow(
      "OpenAI provider is not enabled for MVP",
    );
  });
});
