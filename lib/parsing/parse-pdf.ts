import { extractText, getDocumentProxy } from "unpdf";
import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export async function parsePdf(data: Buffer): Promise<ParsedDocument> {
  let text = "";
  let pageCount = 0;

  try {
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const result = await extractText(pdf, { mergePages: true });

    pageCount = result.totalPages ?? 0;
    text = normalizeText(
      Array.isArray(result.text) ? result.text.join("\n\n") : result.text ?? "",
    );
  } catch (error) {
    console.error("[parsing/pdf]", error);
    throw new Error("Could not read this PDF file.");
  }

  return {
    extractedText: text,
    editorJson: plainTextToEditorJson(text),
    currentMarkdown: text,
    formattingMetadata: { format: "pdf", pageCount },
    wordCount: countWords(text),
    fidelityStatus: "Original Preserved",
    warnings: [
      "PDF formatting may be limited in the editor. Your original file is preserved.",
    ],
  };
}
