import { describe, expect, it } from "vitest";

import {
  DEFAULT_DEEPSEEK_MODEL,
  DEEPSEEK_BASE_URL,
  getDeepSeekModel,
} from "@/lib/ai/providers/deepseek.provider";

describe("DeepSeek provider configuration", () => {
  it("uses the current low-latency DeepSeek model by default", () => {
    expect(DEFAULT_DEEPSEEK_MODEL).toBe("deepseek-v4-flash");
    expect(getDeepSeekModel()).toBe("deepseek-v4-flash");
  });

  it("does not replace an explicitly requested DeepSeek model", () => {
    expect(getDeepSeekModel("deepseek-v4-pro")).toBe("deepseek-v4-pro");
  });

  it("targets the official OpenAI-compatible DeepSeek API base URL", () => {
    expect(DEEPSEEK_BASE_URL).toBe("https://api.deepseek.com");
  });
});
