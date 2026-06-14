import {
  AIProviderError,
  type AIActionResult,
  type AIProvider,
} from "@/lib/ai/ai.types";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

export const openAIProvider: AIProvider = {
  name: "openai",
  defaultModel: DEFAULT_OPENAI_MODEL,
  async run(): Promise<AIActionResult> {
    throw new AIProviderError("OpenAI provider is not enabled for MVP");
  },
};
