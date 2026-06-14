import type { AIActionInput, AIActionResult, AIProvider } from "@/lib/ai/ai.types";
import { aiActionInputSchema } from "@/lib/ai/ai.validators";
import { geminiProvider } from "@/lib/ai/providers/gemini.provider";
import { openAIProvider } from "@/lib/ai/providers/openai.provider";

const providers: Record<AIProvider["name"], AIProvider> = {
  openai: openAIProvider,
  gemini: geminiProvider,
};

export function selectAIProvider(input: AIActionInput): AIProvider {
  if (input.provider) {
    return providers[input.provider];
  }

  if (process.env.OPENAI_API_KEY) {
    return providers.openai;
  }

  if (process.env.GEMINI_API_KEY) {
    return providers.gemini;
  }

  return providers.openai;
}

export async function runAIAction(input: unknown): Promise<AIActionResult> {
  const parsed = aiActionInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("Invalid AI action input");
  }

  const provider = selectAIProvider(parsed.data);

  return provider.run(parsed.data);
}
