import { estimateAICost } from "@/lib/ai/ai-cost";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionResult,
  type AIProviderName,
} from "@/lib/ai/ai.types";
import { parseAIActionOutput } from "@/lib/ai/ai.validators";

type NormalizeProviderResponseInput = {
  input: AIActionInput;
  provider: AIProviderName;
  model: string;
  text: string | undefined;
  inputTokens?: number;
  outputTokens?: number;
};

export function normalizeProviderResponse({
  input,
  provider,
  model,
  text,
  inputTokens,
  outputTokens,
}: NormalizeProviderResponseInput): AIActionResult {
  if (!text) {
    throw new AIProviderError("AI response was empty");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new AIProviderError("AI response was not valid JSON");
  }

  const parsedOutput = parseAIActionOutput(parsedJson);

  if (!parsedOutput.success) {
    throw new AIProviderError("AI response did not match the expected shape");
  }

  return {
    action: input.action,
    mode: parsedOutput.data.mode,
    output: parsedOutput.data,
    summary: parsedOutput.data.summary,
    provider,
    model,
    inputTokens,
    outputTokens,
    estimatedCost: estimateAICost({
      provider,
      model,
      inputTokens,
      outputTokens,
    }),
    warnings: parsedOutput.data.warnings,
  };
}
