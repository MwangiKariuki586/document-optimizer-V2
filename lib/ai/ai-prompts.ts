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

const ACTION_OUTPUT_GUIDANCE: Record<AIActionInput["action"], string> = {
  optimize:
    "Return mode \"preview\" with revisedMarkdown and 3-6 targeted suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  improve_clarity:
    "Return mode \"suggestions\" with 3-6 clarity suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  fix_grammar:
    "Return mode \"suggestions\" with 3-6 grammar suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  rewrite:
    "Return mode \"preview\" with revisedMarkdown and 3-6 wording suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  summarize:
    "Return mode \"preview\" with revisedMarkdown as the summary. Only include suggestions if there are specific source passages worth changing.",
  translate:
    "Return mode \"preview\" with revisedMarkdown as the translated document. Do not include suggestions unless there are source text issues that block a clean translation.",
  tone_analyze:
    "Return mode \"suggestions\" with 3-6 tone suggestions and analysis notes. Each suggestion.originalText must be an exact substring from the original document.",
  seo_analyze:
    "Return mode \"suggestions\" with 3-6 SEO suggestions and analysis notes. Each suggestion.originalText must be an exact substring from the original document.",
  simplify_language:
    "Return mode \"suggestions\" with 3-6 simplification suggestions. Each suggestion.originalText must be an exact substring from the original document.",
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
Output guidance: ${ACTION_OUTPUT_GUIDANCE[input.action]}

Document Markdown:
${input.contentMarkdown}`;
}
