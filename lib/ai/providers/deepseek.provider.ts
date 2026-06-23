import { normalizeProviderResponse } from "@/lib/ai/ai-normalize";
import { buildAIUserPrompt, AI_SYSTEM_PROMPT } from "@/lib/ai/ai-prompts";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionResult,
  type AIProvider,
} from "@/lib/ai/ai.types";

export const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

type DeepSeekUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
};

type DeepSeekChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
    finish_reason?: string | null;
  }>;
  usage?: DeepSeekUsage;
};

type DeepSeekErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string | number;
  };
};

export function getDeepSeekModel(model?: string): string {
  return model ?? DEFAULT_DEEPSEEK_MODEL;
}

function getDeepSeekApiKey(): string {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new AIProviderError("DeepSeek is not configured");
  }

  return apiKey;
}

async function parseDeepSeekError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as DeepSeekErrorResponse;
    return body.error?.message ?? "DeepSeek request failed";
  } catch {
    return "DeepSeek request failed";
  }
}

export const deepSeekProvider: AIProvider = {
  name: "deepseek",
  defaultModel: DEFAULT_DEEPSEEK_MODEL,
  async run(input: AIActionInput): Promise<AIActionResult> {
    const model = getDeepSeekModel(input.model);
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getDeepSeekApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: buildAIUserPrompt(input) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        thinking: { type: "disabled" },
        stream: false,
      }),
    });

    if (!response.ok) {
      const message = await parseDeepSeekError(response);
      console.error("[ai/deepseek]", {
        status: response.status,
        message,
      });
      throw new AIProviderError("DeepSeek request failed");
    }

    const completion = (await response.json()) as DeepSeekChatCompletion;
    const finishReason = completion.choices?.[0]?.finish_reason;

    if (finishReason === "length") {
      throw new AIProviderError("DeepSeek response was too long");
    }

    if (finishReason === "content_filter") {
      throw new AIProviderError("DeepSeek response was filtered");
    }

    if (finishReason === "insufficient_system_resource") {
      throw new AIProviderError("DeepSeek is temporarily unavailable");
    }

    return normalizeProviderResponse({
      input,
      provider: "deepseek",
      model,
      text: completion.choices?.[0]?.message?.content ?? undefined,
      inputTokens: completion.usage?.prompt_tokens,
      outputTokens: completion.usage?.completion_tokens,
    });
  },
};
