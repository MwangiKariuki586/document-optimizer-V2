import { expect, test } from "@playwright/test";

import { runAIAction } from "../../lib/ai/ai-router";
import type { AIActionKey, AIActionOptions } from "../../lib/ai/ai.types";

const AI_ACTIONS: AIActionKey[] = [
  "improvement_scan",
  "proofread_correct",
  "improve_readability",
  "tone_alignment",
  "structure_flow",
  "summarize_shorten",
  "translate_document",
];

const CONTENT_MARKDOWN =
  "Profile summary\n\nI build responsive web apps and improve user-facing workflows.";

const OPTIONS: AIActionOptions = {
  tone: "professional",
  audience: "general",
  language: "en",
  preserveStructure: true,
  toneTarget: "professional",
  summaryOutputType: "short_summary",
  summaryLength: "medium",
  targetLanguage: "sw",
  translationStyle: "natural",
  termsToPreserve: "Docufine",
};

const RESULT_ACTIONS = new Set<AIActionKey>([
  "summarize_shorten",
  "translate_document",
]);

function buildProviderOutput(action: AIActionKey) {
  const isResultAction = RESULT_ACTIONS.has(action);
  const isTranslation = action === "translate_document";
  const isSummary = action === "summarize_shorten";
  const suggestionType =
    action === "proofread_correct"
      ? "grammar"
      : action === "tone_alignment"
        ? "tone"
        : action === "structure_flow"
          ? "structure"
          : "clarity";

  return {
    mode: isResultAction ? "preview" : "suggestions",
    workflow: isResultAction ? "result_preview" : "inline_suggestions",
    resultMode: isTranslation ? "translation" : isSummary ? "summary" : undefined,
    structureChangeLevel: action === "structure_flow" ? "minor" : undefined,
    targetLanguage: isTranslation ? "sw" : undefined,
    summary: `${action} completed.`,
    revisedMarkdown: isResultAction
      ? `${CONTENT_MARKDOWN}\n\nGenerated result for ${action}.`
      : null,
    suggestions: isResultAction
      ? []
      : [
          {
            id: `${action}-suggestion-1`,
            actionType: action === "summarize_shorten" || action === "translate_document"
              ? undefined
              : action,
            type: suggestionType,
            category: suggestionType,
            issueLabel: "Direct wording",
            originalText: "improve user-facing workflows",
            suggestedText: "improve workflows for users",
            explanation: "Makes the wording more direct.",
            reason: "Makes the wording more direct.",
            severity: "medium",
            location: { startOffset: 41, endOffset: 70 },
          },
        ],
    analysis: { clarity: 80, tone: 82, structure: 78, notes: ["Looks consistent."] },
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
    test(`${action} returns the correct workflow`, async () => {
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

      if (RESULT_ACTIONS.has(action)) {
        expect(result.mode).toBe("preview");
        expect(result.output.workflow).toBe("result_preview");
        expect(result.output.suggestions).toHaveLength(0);
        expect(result.output.revisedMarkdown).toContain(
          `Generated result for ${action}.`,
        );
      } else {
        expect(result.mode).toBe("suggestions");
        expect(result.output.workflow).toBe("inline_suggestions");
        expect(result.output.suggestions).toHaveLength(1);
      }

      if (action === "summarize_shorten") {
        expect(result.output.resultMode).toBe("summary");
      }

      if (action === "translate_document") {
        expect(result.output.resultMode).toBe("translation");
        expect(result.output.targetLanguage).toBe("sw");
      }

      if (action === "structure_flow") {
        expect(result.output.structureChangeLevel).toBe("minor");
      }
    });
  }
});
