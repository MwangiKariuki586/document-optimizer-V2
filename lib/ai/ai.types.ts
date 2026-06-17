import type { z } from "zod";

import type {
  aiActionInputSchema,
  aiActionOptionsSchema,
  aiActionOutputSchema,
  aiActionSchema,
  aiProviderSchema,
} from "@/lib/ai/ai.validators";

export type AIActionKey = z.infer<typeof aiActionSchema>;

export type AIProviderName = z.infer<typeof aiProviderSchema>;

export type AIActionOptions = z.infer<typeof aiActionOptionsSchema>;

export type AIActionInput = z.infer<typeof aiActionInputSchema>;

export type AIActionOutput = z.infer<typeof aiActionOutputSchema>;

export type AIResultMode = "preview" | "suggestions" | "analysis";

export type AIActionResult = {
  action: AIActionKey;
  mode: AIResultMode;
  output: AIActionOutput;
  summary: string;
  provider: AIProviderName;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  warnings: string[];
};

export type AIRequestPreview = {
  id: string;
  documentId: string;
  documentTitle: string;
  action: AIActionKey;
  status: string;
  originalMarkdown: string;
  output: AIActionOutput;
  provider: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  completedAt: string | null;
};

export type AIProvider = {
  name: AIProviderName;
  defaultModel: string;
  run: (input: AIActionInput) => Promise<AIActionResult>;
};

export class AIProviderError extends Error {
  constructor(message = "AI provider failed") {
    super(message);
    this.name = "AIProviderError";
  }
}
