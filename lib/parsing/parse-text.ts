import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export function parseText(data: Buffer): ParsedDocument {
  const text = normalizeText(data.toString("utf-8"));

  return {
    extractedText: text,
    editorJson: plainTextToEditorJson(text),
    currentMarkdown: text,
    formattingMetadata: null,
    wordCount: countWords(text),
    fidelityStatus: "Plain Text Only",
    warnings: [],
  };
}
