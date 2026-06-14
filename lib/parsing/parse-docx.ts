import mammoth from "mammoth";
import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export async function parseDocx(data: Buffer): Promise<ParsedDocument> {
  let text = "";
  let html: string | null = null;

  try {
    const [rawText, converted] = await Promise.all([
      mammoth.extractRawText({ buffer: data }),
      mammoth.convertToHtml({ buffer: data }),
    ]);

    text = normalizeText(rawText.value ?? "");
    html = converted.value ?? null;
  } catch (error) {
    console.error("[parsing/docx]", error);
    throw new Error("Could not read this DOCX file.");
  }

  return {
    extractedText: text,
    editorJson: plainTextToEditorJson(text),
    currentMarkdown: text,
    // Original HTML is retained as a structure hint; full rich rehydration into the
    // editor schema is handled in the editor phase.
    formattingMetadata: html ? { format: "docx", html } : { format: "docx" },
    wordCount: countWords(text),
    fidelityStatus: "Limited Formatting",
    warnings: [
      "Editable formatting may be limited for this DOCX. Your original file is preserved.",
    ],
  };
}
