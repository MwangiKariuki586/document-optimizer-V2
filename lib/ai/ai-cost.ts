import type { AIProviderName } from "@/lib/ai/ai.types";

type ModelCost = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const MODEL_COSTS: Record<string, ModelCost> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gemini-2.5-flash": { inputPerMillion: 0.3, outputPerMillion: 2.5 },
  "gemini-2.5-flash-lite": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "deepseek-v4-flash": { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  "deepseek-v4-pro": { inputPerMillion: 0.435, outputPerMillion: 0.87 },
};

export function estimateAICost(input: {
  provider: AIProviderName;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}): number | undefined {
  if (input.inputTokens === undefined && input.outputTokens === undefined) {
    return undefined;
  }

  const cost = MODEL_COSTS[input.model];

  if (!cost) {
    return undefined;
  }

  const inputCost =
    ((input.inputTokens ?? 0) / 1_000_000) * cost.inputPerMillion;
  const outputCost =
    ((input.outputTokens ?? 0) / 1_000_000) * cost.outputPerMillion;

  return Number((inputCost + outputCost).toFixed(6));
}
