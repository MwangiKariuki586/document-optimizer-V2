import type { AIActionInput, AIActionResult, AIProvider } from "@/lib/ai/ai.types";
import { aiActionInputSchema } from "@/lib/ai/ai.validators";
import { geminiProvider } from "@/lib/ai/providers/gemini.provider";
import { openAIProvider } from "@/lib/ai/providers/openai.provider";

const providers: Record<AIProvider["name"], AIProvider> = {
  gemini: geminiProvider,
  openai: openAIProvider,
};

const DEFAULT_AI_PROVIDER: AIProvider["name"] = "gemini";

export function selectAIProvider(input: AIActionInput): AIProvider {
  if (input.provider) {
    return providers[input.provider];
  }

  return providers[DEFAULT_AI_PROVIDER];
}

export async function runAIAction(input: unknown): Promise<AIActionResult> {
  const parsed = aiActionInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid AI action input");
  }

  const provider = selectAIProvider(parsed.data);

  return provider.run(parsed.data);
}
