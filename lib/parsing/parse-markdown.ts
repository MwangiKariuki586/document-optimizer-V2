import {
  countWords,
  normalizeText,
} from "@/lib/documents/text-to-editor";
import { markdownToEditorJson } from "@/lib/documents/markdown-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export function parseMarkdown(data: Buffer): ParsedDocument {
  const markdown = normalizeText(data.toString("utf-8"));

  return {
    extractedText: markdown,
    editorJson: markdownToEditorJson(markdown),
    currentMarkdown: markdown,
    formattingMetadata: { format: "markdown" },
    wordCount: countWords(markdown),
    fidelityStatus: "Structure Preserved",
    warnings: [],
  };
}
