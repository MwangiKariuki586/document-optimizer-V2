import type { AIActionInput } from "@/lib/ai/ai.types";

const ACTION_INSTRUCTIONS: Record<AIActionInput["action"], string> = {
  improvement_scan:
    "Run a full document review and highlight opportunities across clarity, grammar, tone, structure, and formatting. Do not change the document automatically.",
  proofread_correct:
    "Correct only grammar, spelling, punctuation, capitalization, and typos. Avoid broad rewrites, readability edits, tone changes, structural changes, formatting changes, or summarization.",
  improve_readability:
    "Make confusing sentences, phrases, or words easier to read while preserving the original meaning. Focus on readability and simpler phrasing only. Do not shorten the document into a summary, perform grammar-only cleanup, restructure the document, or change tone unless needed for readability.",
  tone_alignment:
    "Adjust writing style to match the selected tone, audience, and purpose. Suggest only tone-focused changes that improve audience fit. Do not perform grammar cleanup, readability rewrites, structural changes, summarization, or translation.",
  structure_flow:
    "Improve document organization, headings, section order, paragraph flow, repeated ideas, and logical progression. For minor issues, suggest only section-level or paragraph-level structure changes. For major restructuring, return a full proposed document for preview. Do not perform grammar cleanup, tone alignment, summarization, or translation.",
  summarize_shorten:
    "Create the requested concise version or summary. Preserve the original document by returning a separate result preview, not inline suggestions.",
  translate_document:
    "Create a full translated version in the requested language and style while preserving the original document.",
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
  improvement_scan:
    "Return mode \"suggestions\", workflow \"inline_suggestions\", revisedMarkdown null, and up to 6 high-confidence suggestions grouped across grammar, clarity, tone, conciseness, structure, and formatting where relevant. Only include a suggestion if the replacement is meaningfully better than the original. Never include identical originalText and suggestedText. Prefer no suggestion over a weak suggestion. Do not return a full rewrite or summary. Each suggestion.originalText must be an exact substring from the original document, and include location.startOffset/location.endOffset when possible.",
  proofread_correct:
    "Return mode \"suggestions\", workflow \"inline_suggestions\", revisedMarkdown null, and up to 8 high-confidence grammar, spelling, punctuation, capitalization, or typo suggestions. Use category/type \"grammar\" for every suggestion. If more than 8 issues exist, choose the most clear and important corrections. Do not suggest style, tone, clarity, conciseness, formatting, or structure changes. Each suggestion.originalText must be an exact substring from the original document.",
  improve_readability:
    "Return mode \"suggestions\", workflow \"inline_suggestions\", revisedMarkdown null, and up to 6 high-confidence clarity or conciseness suggestions that preserve meaning. Use only category/type \"clarity\" or \"conciseness\". Do not include grammar-only, tone, structure, formatting, or summary suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  tone_alignment:
    "Return mode \"suggestions\", workflow \"inline_suggestions\", revisedMarkdown null, and up to 6 high-confidence tone suggestions. Use only category/type \"tone\". Each reason must explain why the suggested tone better fits the selected audience or purpose. Do not include grammar, clarity, conciseness, structure, formatting, summary, or translation suggestions. Each suggestion.originalText must be an exact substring from the original document.",
  structure_flow:
    "For minor organization fixes, return mode \"suggestions\", workflow \"inline_suggestions\", structureChangeLevel \"minor\", revisedMarkdown null, and up to 6 section-level or paragraph-level suggestions. Use only category/type \"structure\". For major restructuring, return mode \"preview\", workflow \"result_preview\", resultMode \"optimization\", structureChangeLevel \"major\", revisedMarkdown as the full structured result, and suggestions as an empty array. Never silently rearrange content, and do not include grammar, clarity, tone, conciseness, formatting, summary, or translation suggestions.",
  summarize_shorten:
    "Return mode \"preview\", workflow \"result_preview\", resultMode \"summary\", revisedMarkdown as the requested summary or shortened version, and suggestions as an empty array. Do not create optimization highlights.",
  translate_document:
    "Return mode \"preview\", workflow \"result_preview\", resultMode \"translation\", revisedMarkdown as the full translated document, and suggestions as an empty array. Do not create word-level translation suggestions.",
  optimize:
    "Return mode \"preview\" with revisedMarkdown and 3-6 targeted suggestions. Use suggestion.type from grammar, clarity, tone, conciseness, structure, or formatting. Each suggestion.originalText must be an exact substring from the original document.",
  improve_clarity:
    "Return mode \"suggestions\" with 3-6 clarity or conciseness suggestions and set revisedMarkdown to null. Do not rewrite the whole document. Each suggestion.originalText must be an exact substring from the original document.",
  fix_grammar:
    "Return mode \"suggestions\" with 3-6 grammar suggestions and set revisedMarkdown to null. Do not rewrite the whole document. Each suggestion.originalText must be an exact substring from the original document.",
  rewrite:
    "Return mode \"preview\" with revisedMarkdown and 3-6 wording suggestions. Use clarity, tone, conciseness, structure, or formatting as appropriate. Each suggestion.originalText must be an exact substring from the original document.",
  summarize:
    "Return mode \"preview\" with revisedMarkdown as the summary. Only include suggestions if there are specific source passages worth changing.",
  translate:
    "Return mode \"preview\" with revisedMarkdown as the translated document. Do not include suggestions unless there are source text issues that block a clean translation.",
  tone_analyze:
    "Return mode \"suggestions\" with 3-6 tone suggestions and analysis notes, and set revisedMarkdown to null. Do not rewrite the whole document. Each suggestion.originalText must be an exact substring from the original document.",
  seo_analyze:
    "Return mode \"suggestions\" with 3-6 structure, clarity, formatting, or conciseness suggestions for search readability and headings. Set revisedMarkdown to null. Do not rewrite the whole document. Each suggestion.originalText must be an exact substring from the original document.",
  simplify_language:
    "Return mode \"suggestions\" with 3-6 simplification suggestions and set revisedMarkdown to null. Do not rewrite the whole document. Each suggestion.originalText must be an exact substring from the original document.",
};

const LANGUAGE_LABELS: Record<NonNullable<AIActionInput["options"]["language"]>, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
};

const TRANSLATION_LANGUAGE_LABELS: Record<
  NonNullable<AIActionInput["options"]["targetLanguage"]>,
  string
> = {
  en: "English",
  sw: "Swahili",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  ar: "Arabic",
  hi: "Hindi",
  "zh-CN": "Chinese Simplified",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  ru: "Russian",
  pl: "Polish",
  uk: "Ukrainian",
  id: "Indonesian",
  ms: "Malay",
  vi: "Vietnamese",
  th: "Thai",
  fil: "Filipino / Tagalog",
};

export const AI_SYSTEM_PROMPT = `You are Docufine's AI document assistant.
Return only valid JSON matching this exact shape:
{
  "mode": "preview" | "suggestions" | "analysis",
  "workflow": "inline_suggestions" | "result_preview",
  "resultMode": "optimization" | "summary" | "translation",
  "structureChangeLevel": "minor" | "major",
  "targetLanguage": "Only for translation results, use the requested target language code",
  "summary": "Short human-readable summary",
  "revisedMarkdown": "Full revised markdown or null",
  "suggestions": [
    {
      "id": "Stable suggestion id",
      "actionType": "improvement_scan" | "proofread_correct" | "improve_readability" | "tone_alignment" | "structure_flow",
      "type": "grammar" | "clarity" | "tone" | "conciseness" | "structure" | "formatting",
      "category": "grammar" | "clarity" | "tone" | "conciseness" | "structure" | "formatting",
      "issueLabel": "Brief issue label",
      "originalText": "Text being improved",
      "suggestedText": "Suggested replacement",
      "explanation": "Why this helps",
      "reason": "Why this helps",
      "severity": "low" | "medium" | "high",
      "location": {
        "startOffset": 0,
        "endOffset": 10,
        "blockId": "optional-block-id"
      }
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

function buildActionSetup(input: AIActionInput, language: string): string {
  if (input.action === "summarize_shorten") {
    return [
      `Summary output type: ${input.options.summaryOutputType ?? "short_summary"}`,
      `Summary length: ${input.options.summaryLength ?? "medium"}`,
      `Output language: ${language}`,
      "Do not translate the document.",
    ].join("\n");
  }

  if (input.action === "translate_document") {
    const targetLanguage = input.options.targetLanguage
      ? TRANSLATION_LANGUAGE_LABELS[input.options.targetLanguage]
      : language;

    return [
      `Source language: ${language}`,
      `Target language: ${targetLanguage}`,
      `Translation style: ${input.options.translationStyle ?? "natural"}`,
      `Terms to preserve: ${input.options.termsToPreserve ?? "none"}`,
      "Do not summarize, shorten, proofread, or create inline suggestions.",
    ].join("\n");
  }

  if (input.action === "tone_alignment") {
    return [
      `Target tone: ${input.options.toneTarget ?? input.options.tone}`,
      `Audience or purpose: ${input.options.audienceOrPurpose ?? input.options.audience}`,
    ].join("\n");
  }

  return [
    `Target tone: ${input.options.tone}`,
    `Audience: ${input.options.audience}`,
  ].join("\n");
}

export function buildAIUserPrompt(input: AIActionInput): string {
  const title = input.title ? `Title: ${input.title}` : "Title: Untitled";
  const language = LANGUAGE_LABELS[input.options.language];
  const preserveStructure = input.options.preserveStructure
    ? "Preserve document headings, lists, and markdown structure where possible."
    : "Structure may be changed if it improves the result.";
  const setup = buildActionSetup(input, language);

  return `${title}
Action: ${input.action}
Instruction: ${ACTION_INSTRUCTIONS[input.action]}
Document language: ${language}
${setup}
Structure: ${preserveStructure}
Output guidance: ${ACTION_OUTPUT_GUIDANCE[input.action]}
Suggestion anchoring rule: copy every suggestion.originalText verbatim from Document Markdown, including punctuation, capitalization, and spacing. Never paraphrase originalText. If a passage cannot be copied exactly and uniquely, omit that suggestion.
Suggestion quality rule: never include no-op suggestions, duplicate targets, or cosmetic whitespace-only changes unless the category is formatting.

Document Markdown:
${input.contentMarkdown}`;
}
