import { parsePdf } from "@/lib/parsing/parse-pdf";
import { parseDocx } from "@/lib/parsing/parse-docx";
import { parseMarkdown } from "@/lib/parsing/parse-markdown";
import { parseText } from "@/lib/parsing/parse-text";

export type ParsedFileType = "pdf" | "docx" | "markdown" | "txt";

export type ParsedDocument = {
  extractedText: string;
  editorJson: unknown | null;
  currentMarkdown: string | null;
  formattingMetadata: Record<string, unknown> | null;
  wordCount: number;
  fidelityStatus: string;
  warnings: string[];
};

export async function parseFile(
  fileType: ParsedFileType,
  data: Buffer,
): Promise<ParsedDocument> {
  switch (fileType) {
    case "pdf":
      return parsePdf(data);
    case "docx":
      return parseDocx(data);
    case "markdown":
      return parseMarkdown(data);
    case "txt":
      return parseText(data);
    default:
      throw new Error("Unsupported file type");
  }
}
