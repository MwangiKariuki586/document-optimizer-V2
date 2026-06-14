import { GoogleGenAI } from "@google/genai";

import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";
import { buildAIUserPrompt, AI_SYSTEM_PROMPT } from "@/lib/ai/ai-prompts";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionResult,
  type AIProvider,
} from "@/lib/ai/ai.types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

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
    const model = input.model ?? DEFAULT_GEMINI_MODEL;
    const ai = getGeminiClient();

    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildAIUserPrompt(input),
        config: {
          systemInstruction: AI_SYSTEM_PROMPT,
          temperature: 0.3,
          responseMimeType: "application/json",
        },
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
      if (error instanceof AIProviderError) {
        throw error;
      }

      console.error("[ai/gemini]", error);
      throw new AIProviderError("Gemini request failed");
    }
  },
};
