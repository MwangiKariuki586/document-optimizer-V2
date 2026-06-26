import { GoogleGenAI } from "@google/genai";

import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";
import { buildAIUserPrompt, AI_SYSTEM_PROMPT } from "@/lib/ai/ai-prompts";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionResult,
  type AIProvider,
} from "@/lib/ai/ai.types";

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-3.1-flash-lite";

type GeminiGenerateConfig = {
  systemInstruction: string;
  temperature: number;
  responseMimeType: "application/json";
  responseJsonSchema: Record<string, unknown>;
  thinkingConfig?: { thinkingBudget: number };
};

const AI_RESPONSE_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "mode",
    "summary",
    "revisedMarkdown",
    "suggestions",
    "analysis",
    "warnings",
  ],
  properties: {
    mode: { type: "string", enum: ["preview", "suggestions", "analysis"] },
    summary: { type: "string", minLength: 1 },
    revisedMarkdown: { type: ["string", "null"], minLength: 1 },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "originalText", "suggestedText", "explanation"],
        properties: {
          type: {
            type: "string",
            enum: [
              "grammar",
              "clarity",
              "tone",
              "conciseness",
              "structure",
              "formatting",
            ],
          },
          originalText: { type: "string", minLength: 1 },
          suggestedText: { type: "string", minLength: 1 },
          explanation: { type: "string", minLength: 1 },
        },
      },
    },
    analysis: {
      type: "object",
      additionalProperties: false,
      required: ["clarity", "tone", "structure", "seo", "notes"],
      properties: {
        clarity: { type: "integer", minimum: 0, maximum: 100 },
        tone: { type: "integer", minimum: 0, maximum: 100 },
        structure: { type: "integer", minimum: 0, maximum: 100 },
        seo: { type: "integer", minimum: 0, maximum: 100 },
        notes: {
          type: "array",
          items: { type: "string", minLength: 1 },
        },
      },
    },
    warnings: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
  },
};

export function getGeminiModelCandidates(model?: string): string[] {
  return model
    ? [model]
    : [DEFAULT_GEMINI_MODEL, DEFAULT_GEMINI_FALLBACK_MODEL];
}

export function getGeminiGenerateConfig(model: string): GeminiGenerateConfig {
  return {
    systemInstruction: AI_SYSTEM_PROMPT,
    temperature: 0.3,
    responseMimeType: "application/json",
    responseJsonSchema: AI_RESPONSE_JSON_SCHEMA,
    ...(model.startsWith("gemini-2.5-")
      ? { thinkingConfig: { thinkingBudget: 0 } }
      : {}),
  };
}

function isTransientGeminiError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: number;
    status?: string;
    message?: string;
  };
  const message = candidate.message?.toLowerCase() ?? "";

  return (
    candidate.code === 429 ||
    candidate.code === 500 ||
    candidate.code === 503 ||
    candidate.status === "RESOURCE_EXHAUSTED" ||
    candidate.status === "UNAVAILABLE" ||
    message.includes('"code":429') ||
    message.includes('"code":500') ||
    message.includes('"code":503') ||
    message.includes("high demand") ||
    message.includes("resource_exhausted") ||
    message.includes("unavailable")
  );
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AIProviderError("Gemini is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  defaultModel: DEFAULT_GEMINI_MODEL,
  async run(input: AIActionInput): Promise<AIActionResult> {
    const ai = getGeminiClient();
    const modelCandidates = getGeminiModelCandidates(input.model);

    for (const [index, model] of modelCandidates.entries()) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: buildAIUserPrompt(input),
          config: getGeminiGenerateConfig(model),
        });

        return normalizeProviderResponse({
          input,
          provider: "gemini",
          model,
          text: response.text,
          inputTokens: response.usageMetadata?.promptTokenCount,
          outputTokens: response.usageMetadata?.candidatesTokenCount,
        });
      } catch (error) {
        const hasFallback = index < modelCandidates.length - 1;

        if (error instanceof AIProviderError) {
          if (hasFallback) {
            console.warn("[ai/gemini] invalid default-model response; using fallback", {
              model,
              fallbackModel: modelCandidates[index + 1],
            });
            continue;
          }

          throw error;
        }

        if (hasFallback && isTransientGeminiError(error)) {
          console.warn("[ai/gemini] transient provider failure; using fallback", {
            model,
            fallbackModel: modelCandidates[index + 1],
          });
          continue;
        }

        console.error("[ai/gemini]", error);
        throw new AIProviderError("Gemini request failed");
      }
    }

    throw new AIProviderError("Gemini request failed");
  },
};
