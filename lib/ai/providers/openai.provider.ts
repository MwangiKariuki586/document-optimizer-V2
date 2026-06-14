import OpenAI from "openai";

import { buildAIUserPrompt, AI_SYSTEM_PROMPT } from "@/lib/ai/ai-prompts";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionResult,
  type AIProvider,
} from "@/lib/ai/ai.types";
import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIProviderError("OpenAI is not configured");
  }

  return new OpenAI({ apiKey });
}

export const openAIProvider: AIProvider = {
  name: "openai",
  defaultModel: DEFAULT_OPENAI_MODEL,
  async run(input: AIActionInput): Promise<AIActionResult> {
    const model = input.model ?? DEFAULT_OPENAI_MODEL;
    const client = getOpenAIClient();

    try {
      const response = await client.chat.completions.create({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: buildAIUserPrompt(input) },
        ],
      });

      return normalizeProviderResponse({
        input,
        provider: "openai",
        model,
        text: response.choices[0]?.message.content ?? undefined,
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      });
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }

      console.error("[ai/openai]", error);
      throw new AIProviderError("OpenAI request failed");
    }
  },
};
