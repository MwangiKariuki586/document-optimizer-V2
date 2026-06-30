import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deepSeekProvider,
  DEFAULT_DEEPSEEK_MODEL,
  DEEPSEEK_BASE_URL,
  getDeepSeekModel,
} from "@/lib/ai/providers/deepseek.provider";

const originalDeepSeekKey = process.env.DEEPSEEK_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalDeepSeekKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalDeepSeekKey;
  }
});

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

  it("retries one transient network failure", async () => {
    process.env.DEEPSEEK_API_KEY = "test-key";
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: "stop",
                message: {
                  content: JSON.stringify({
                    mode: "suggestions",
                    summary: "Done",
                    revisedMarkdown: null,
                    suggestions: [],
                    analysis: { notes: [] },
                    warnings: [],
                  }),
                },
              },
            ],
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await deepSeekProvider.run({
      action: "proofread_correct",
      contentMarkdown: "Test content.",
      options: {
        tone: "professional",
        audience: "general",
        language: "en",
        preserveStructure: true,
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
