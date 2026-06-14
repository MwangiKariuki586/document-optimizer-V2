import type { AIActionInput } from "@/lib/ai/ai.types";

const ACTION_INSTRUCTIONS: Record<AIActionInput["action"], string> = {
  optimize:
    "Improve the document across clarity, tone, structure, and usefulness while preserving the user's intent.",
  improve_clarity:
    "Make the document easier to understand. Simplify complex sentences and remove ambiguity.",
  fix_grammar:
    "Correct grammar, spelling, punctuation, and awkward phrasing without changing the meaning.",
  rewrite:
    "Rewrite the document with fresher wording while keeping the same core message and structure.",
  summarize:
    "Summarize the document clearly. Return a concise revisedMarkdown summary.",
  translate:
    "Translate the document into the requested language while preserving headings and list structure.",
  tone_analyze:
    "Analyze the document tone and provide actionable recommendations. Do not rewrite the full document unless needed.",
  seo_analyze:
    "Analyze keyword usage, headings, search relevance, and opportunities for SEO improvement.",
  simplify_language:
    "Simplify the document language for easier reading while preserving important details.",
};

const LANGUAGE_LABELS: Record<AIActionInput["options"]["language"], string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

export const AI_SYSTEM_PROMPT = `You are Document Optimizer's AI document assistant.
Return only valid JSON matching this exact shape:
{
  "mode": "preview" | "suggestions" | "analysis",
  "summary": "Short human-readable summary",
  "revisedMarkdown": "Full revised markdown or null",
  "suggestions": [
    {
      "type": "clarity" | "grammar" | "tone" | "structure" | "seo",
      "originalText": "Text being improved",
      "suggestedText": "Suggested replacement",
      "explanation": "Why this helps"
    }
  ],
  "analysis": {
    "clarity": 0,
    "tone": 0,
    "structure": 0,
    "seo": 0,
    "notes": ["Brief note"]
  },
  "warnings": ["Optional warning"]
}
Never say that changes were applied. AI output is preview-only until the user explicitly applies it.`;

export function buildAIUserPrompt(input: AIActionInput): string {
  const title = input.title ? `Title: ${input.title}` : "Title: Untitled";
  const language = LANGUAGE_LABELS[input.options.language];
  const preserveStructure = input.options.preserveStructure
    ? "Preserve document headings, lists, and markdown structure where possible."
    : "Structure may be changed if it improves the result.";

  return `${title}
Action: ${input.action}
Instruction: ${ACTION_INSTRUCTIONS[input.action]}
Tone: ${input.options.tone}
Audience: ${input.options.audience}
Language: ${language}
Structure: ${preserveStructure}

Document Markdown:
${input.contentMarkdown}`;
}
