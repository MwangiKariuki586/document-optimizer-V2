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
const DEEPSEEK_RETRY_DELAY_MS = 400;

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

function isTransientStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function waitForRetry(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, DEEPSEEK_RETRY_DELAY_MS));
}

async function requestDeepSeek(
  input: AIActionInput,
  model: string,
): Promise<Response> {
  const apiKey = getDeepSeekApiKey();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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

      if (response.ok || !isTransientStatus(response.status) || attempt === 1) {
        return response;
      }

      console.warn("[ai/deepseek] transient response; retrying", {
        status: response.status,
        attempt: attempt + 1,
      });
    } catch (error) {
      if (attempt === 1) {
        console.error("[ai/deepseek] network failure", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
        throw new AIProviderError("DeepSeek transient request failed");
      }

      console.warn("[ai/deepseek] network failure; retrying", {
        attempt: attempt + 1,
      });
    }

    await waitForRetry();
  }

  throw new AIProviderError("DeepSeek transient request failed");
}

export const deepSeekProvider: AIProvider = {
  name: "deepseek",
  defaultModel: DEFAULT_DEEPSEEK_MODEL,
  async run(input: AIActionInput): Promise<AIActionResult> {
    const model = getDeepSeekModel(input.model);
    const response = await requestDeepSeek(input, model);

    if (!response.ok) {
      const message = await parseDeepSeekError(response);
      console.error("[ai/deepseek]", {
        status: response.status,
        message,
      });
      throw new AIProviderError(
        isTransientStatus(response.status)
          ? "DeepSeek transient request failed"
          : "DeepSeek request failed",
      );
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
      throw new AIProviderError("DeepSeek transient request failed");
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
