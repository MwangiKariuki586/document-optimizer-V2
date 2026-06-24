import mammoth from "mammoth";
import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import { tryHtmlToEditorJson } from "@/lib/documents/html-to-editor";
import { editorJsonToMarkdown } from "@/lib/documents/markdown-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

export async function parseDocx(data: Buffer): Promise<ParsedDocument> {
  let text = "";
  let html: string | null = null;
  let conversionWarnings: string[] = [];

  try {
    const [rawText, converted] = await Promise.all([
      mammoth.extractRawText({ buffer: data }),
      mammoth.convertToHtml(
        { buffer: data },
        {
          convertImage: mammoth.images.dataUri,
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => p.subtitle:fresh",
          ],
        },
      ),
    ]);

    text = normalizeText(rawText.value ?? "");
    html = converted.value ?? null;
    conversionWarnings = (converted.messages ?? [])
      .map((message) => message.message)
      .filter(Boolean);
  } catch (error) {
    console.error("[parsing/docx]", error);
    throw new Error("Could not read this DOCX file.");
  }

  const richEditorJson = html?.trim() ? tryHtmlToEditorJson(html) : null;
  const editorJson = richEditorJson ?? plainTextToEditorJson(text);
  const currentMarkdown = richEditorJson
    ? editorJsonToMarkdown(richEditorJson)
    : text;
  const limitedFormatting = !richEditorJson;

  return {
    extractedText: text,
    editorJson,
    currentMarkdown,
    formattingMetadata: {
      format: "docx",
      ...(html ? { html } : {}),
      ...(conversionWarnings.length > 0 ? { conversionWarnings } : {}),
    },
    wordCount: countWords(text),
    fidelityStatus: limitedFormatting
      ? "Limited Formatting"
      : "Structure Preserved",
    warnings: limitedFormatting
      ? [
          "Editable formatting may be limited for this DOCX. Your original file is preserved.",
        ]
      : conversionWarnings,
  };
}
