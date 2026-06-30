import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AIActionResult } from "@/lib/ai/ai.types";

const mocks = vi.hoisted(() => ({
  runAIAction: vi.fn(),
  saveSuggestionsFromAIResult: vi.fn(),
}));

vi.mock("@/lib/ai/ai-router", () => ({
  runAIAction: mocks.runAIAction,
}));

vi.mock("@/lib/suggestions/suggestions.service", () => ({
  saveSuggestionsFromAIResult: mocks.saveSuggestionsFromAIResult,
}));

import { runDocumentAIAction } from "@/lib/ai/ai.service";

type FakeSupabaseState = {
  aiRequestStatus: string | null;
  aiRequestOutput: unknown;
  usageInserted: boolean;
};

function createFakeSupabase(state: FakeSupabaseState) {
  return {
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle() {
          if (table === "documents") {
            return Promise.resolve({
              data: {
                id: "document-1",
                title: "Document",
                word_count: 12,
              },
              error: null,
            });
          }

          return Promise.resolve({ data: null, error: null });
        },
        single() {
          if (table === "ai_requests") {
            return Promise.resolve({
              data: { id: "request-1" },
              error: null,
            });
          }

          return Promise.resolve({ data: null, error: null });
        },
        insert() {
          if (table === "usage_ledger") {
            state.usageInserted = true;
            return Promise.resolve({ error: null });
          }

          return this;
        },
        update(payload: { status?: string; output?: unknown }) {
          if (table === "ai_requests") {
            state.aiRequestStatus = payload.status ?? null;
            state.aiRequestOutput = payload.output;
          }

          return this;
        },
      };
    },
  };
}

const aiResult: AIActionResult = {
  action: "improve_readability",
  mode: "suggestions",
  summary: "Suggested clearer phrasing.",
  provider: "deepseek",
  model: "deepseek-v4-flash",
  output: {
    mode: "suggestions",
    summary: "Suggested clearer phrasing.",
    revisedMarkdown: null,
    suggestions: [],
    analysis: { notes: [] },
    warnings: [],
  },
  warnings: [],
};

describe("runDocumentAIAction", () => {
  beforeEach(() => {
    mocks.runAIAction.mockReset();
    mocks.saveSuggestionsFromAIResult.mockReset();
  });

  it("keeps a valid AI result completed when suggestion persistence fails", async () => {
    const state: FakeSupabaseState = {
      aiRequestStatus: null,
      aiRequestOutput: null,
      usageInserted: false,
    };
    const supabase = createFakeSupabase(state);
    mocks.runAIAction.mockResolvedValue(aiResult);
    mocks.saveSuggestionsFromAIResult.mockRejectedValue(
      new Error("Failed to save AI suggestions"),
    );

    const result = await runDocumentAIAction(supabase as never, {
      userId: "user-1",
      documentId: "document-1",
      action: "improve_readability",
      contentMarkdown: "Document content",
      options: {
        tone: "professional",
        audience: "general",
        language: "en",
        preserveStructure: true,
      },
    });

    expect(result).toEqual({
      status: "completed",
      id: "request-1",
      result: aiResult,
      suggestions: [],
    });
    expect(state.aiRequestStatus).toBe("completed");
    expect(state.aiRequestOutput).toEqual(aiResult.output);
    expect(state.usageInserted).toBe(true);
  });
});
