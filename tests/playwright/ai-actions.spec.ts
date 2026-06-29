import { expect, test } from "@playwright/test";

import { runAIAction } from "../../lib/ai/ai-router";
import type { AIActionKey, AIActionOptions } from "../../lib/ai/ai.types";

const AI_ACTIONS: AIActionKey[] = [
  "optimize",
  "improve_clarity",
  "fix_grammar",
  "rewrite",
  "summarize",
  "translate",
  "tone_analyze",
  "seo_analyze",
  "simplify_language",
];

const CONTENT_MARKDOWN =
  "Profile summary\n\nI build responsive web apps and improve user-facing workflows.";

const OPTIONS: AIActionOptions = {
  tone: "professional",
  audience: "general",
  language: "en",
  preserveStructure: true,
};

const PREVIEW_ACTIONS = new Set<AIActionKey>([
  "optimize",
  "rewrite",
  "summarize",
  "translate",
]);

function buildProviderOutput(action: AIActionKey) {
  const mode = PREVIEW_ACTIONS.has(action) ? "preview" : "suggestions";

  return {
    mode,
    summary: `${action} completed.`,
    revisedMarkdown:
      mode === "preview"
        ? `${CONTENT_MARKDOWN}\n\nImproved for ${action}.`
        : null,
    suggestions:
      mode === "suggestions"
        ? [
            {
              type: action === "fix_grammar" ? "grammar" : "clarity",
              originalText: "improve user-facing workflows",
              suggestedText: "improve workflows for users",
              explanation: "Makes the wording more direct.",
            },
          ]
        : [],
    analysis:
      action === "tone_analyze" || action === "seo_analyze"
        ? { clarity: 80, tone: 82, structure: 78, seo: 75, notes: ["Looks consistent."] }
        : null,
    warnings: null,
  };
}

test.describe("AI actions", () => {
  const originalDeepSeekKey = process.env.DEEPSEEK_API_KEY;
  const originalFetch = globalThis.fetch;
  const requestedActions: string[] = [];

  test.beforeEach(() => {
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    requestedActions.length = 0;
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as {
        messages: Array<{ role: string; content: string }>;
      };
      const userPrompt =
        body.messages.find((message) => message.role === "user")?.content ?? "";
      const action = AI_ACTIONS.find((candidate) =>
        userPrompt.includes(`Action: ${candidate}`),
      );

      if (!action) {
        return new Response(JSON.stringify({ error: { message: "Missing action" } }), {
          status: 400,
        });
      }

      requestedActions.push(action);

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: { content: JSON.stringify(buildProviderOutput(action)) },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 120,
            completion_tokens: 80,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    };
  });

  test.afterEach(() => {
    if (originalDeepSeekKey === undefined) {
      delete process.env.DEEPSEEK_API_KEY;
    } else {
      process.env.DEEPSEEK_API_KEY = originalDeepSeekKey;
    }

    globalThis.fetch = originalFetch;
  });

  for (const action of AI_ACTIONS) {
    test(`${action} returns a normalized result`, async () => {
      const result = await runAIAction({
        action,
        title: "Portfolio Resume",
        contentMarkdown: CONTENT_MARKDOWN,
        options: OPTIONS,
        provider: "deepseek",
      });

      expect(requestedActions).toContain(action);
      expect(result.action).toBe(action);
      expect(result.provider).toBe("deepseek");
      expect(result.model).toBe("deepseek-v4-flash");
      expect(result.summary).toBe(`${action} completed.`);
      expect(result.output.analysis.notes).toBeDefined();
      expect(result.output.warnings).toEqual([]);

      if (PREVIEW_ACTIONS.has(action)) {
        expect(result.mode).toBe("preview");
        expect(result.output.revisedMarkdown).toContain(`Improved for ${action}.`);
      } else {
        expect(result.mode).toBe("suggestions");
        expect(result.output.suggestions).toHaveLength(1);
      }
    });
  }
});
