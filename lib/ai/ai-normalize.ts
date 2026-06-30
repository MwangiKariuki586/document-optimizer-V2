import { estimateAICost } from "@/lib/ai/ai-cost";
import {
  AIProviderError,
  type AIActionInput,
  type AIActionOutput,
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

function getDefaultWorkflow(input: AIActionInput, output: AIActionOutput) {
  if (output.workflow) {
    return output.workflow;
  }

  if (output.mode === "suggestions") {
    return "inline_suggestions" as const;
  }

  if (
    input.action === "summarize_shorten" ||
    input.action === "translate_document" ||
    input.action === "structure_flow"
  ) {
    return "result_preview" as const;
  }

  return output.revisedMarkdown ? "result_preview" as const : "inline_suggestions" as const;
}

function getDefaultResultMode(input: AIActionInput, output: AIActionOutput) {
  if (output.resultMode) {
    return output.resultMode;
  }

  if (input.action === "summarize_shorten") {
    return "summary" as const;
  }

  if (input.action === "translate_document") {
    return "translation" as const;
  }

  if (output.mode === "preview" || output.revisedMarkdown) {
    return "optimization" as const;
  }

  return undefined;
}

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
    console.error("[ai/normalize] invalid provider output", {
      issues: parsedOutput.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      })),
    });
    throw new AIProviderError("AI response did not match the expected shape");
  }

  const output: AIActionOutput = {
    ...parsedOutput.data,
    workflow: getDefaultWorkflow(input, parsedOutput.data),
    resultMode: getDefaultResultMode(input, parsedOutput.data),
    structureChangeLevel:
      input.action === "structure_flow"
        ? (parsedOutput.data.structureChangeLevel ?? "minor")
        : parsedOutput.data.structureChangeLevel,
    targetLanguage:
      input.action === "translate_document"
        ? (parsedOutput.data.targetLanguage ?? input.options.targetLanguage)
        : parsedOutput.data.targetLanguage,
  };

  return {
    action: input.action,
    mode: output.mode,
    output,
    summary: output.summary,
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
    warnings: output.warnings,
  };
}
