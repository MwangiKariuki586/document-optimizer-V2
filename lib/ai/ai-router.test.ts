import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAIAction, selectAIProvider } from "@/lib/ai/ai-router";
import type { AIActionInput } from "@/lib/ai/ai.types";

const baseInput: AIActionInput = {
  action: "optimize",
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

function restoreEnvVar(key: "OPENAI_API_KEY" | "GEMINI_API_KEY", value?: string) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

afterEach(() => {
  restoreEnvVar("OPENAI_API_KEY", originalOpenAIKey);
  restoreEnvVar("GEMINI_API_KEY", originalGeminiKey);
});

describe("selectAIProvider", () => {
  it("uses the explicitly requested provider", () => {
    const provider = selectAIProvider({ ...baseInput, provider: "gemini" });

    expect(provider.name).toBe("gemini");
  });

  it("prefers OpenAI when configured", () => {
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const provider = selectAIProvider(baseInput);

    expect(provider.name).toBe("openai");
  });

  it("falls back to Gemini when only Gemini is configured", () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const provider = selectAIProvider(baseInput);

    expect(provider.name).toBe("gemini");
  });
});

describe("runAIAction", () => {
  it("rejects invalid input before provider execution", async () => {
    await expect(runAIAction({ action: "bad" })).rejects.toThrow(
      "Invalid AI action input",
    );
  });
});
