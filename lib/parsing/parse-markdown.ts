import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export function parseMarkdown(data: Buffer): ParsedDocument {
  const markdown = normalizeText(data.toString("utf-8"));

  return {
    extractedText: markdown,
    editorJson: plainTextToEditorJson(markdown),
    currentMarkdown: markdown,
    formattingMetadata: { format: "markdown" },
    wordCount: countWords(markdown),
    fidelityStatus: "Structure Preserved",
    warnings: [],
  };
}
