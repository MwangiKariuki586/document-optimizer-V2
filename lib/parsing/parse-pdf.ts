import {
  extractText,
  extractTextItems,
  getDocumentProxy,
  type StructuredTextItem,
} from "unpdf";
import {
  countWords,
  normalizeText,
  plainTextToEditorJson,
} from "@/lib/documents/text-to-editor";
import { markdownToEditorJson } from "@/lib/documents/markdown-to-editor";
import type { ParsedDocument } from "@/lib/parsing/parse-file";

type PdfLine = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  height: number;
};

type PdfBlock =
  | {
      type: "heading";
      level: 1 | 2;
      text: string;
    }
  | {
      type: "paragraph";
      lines: string[];
    }
  | {
      type: "list";
      items: string[];
    };

type ReconstructedPdf = {
  markdown: string;
  plainText: string;
  itemCount: number;
  lineCount: number;
};

function median(values: number[]): number {
  const sorted = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return 0;
  }

  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isPunctuationStart(value: string): boolean {
  return /^[,.;:!?%)\]}]/.test(value);
}

function joinLineItems(items: StructuredTextItem[]): string {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  const parts: string[] = [];
  let previous: StructuredTextItem | null = null;

  for (const item of sorted) {
    const text = cleanText(item.str);

    if (!text) {
      continue;
    }

    if (previous) {
      const previousRight = previous.x + previous.width;
      const gap = item.x - previousRight;
      const gapThreshold = Math.max(1.8, previous.fontSize * 0.22);
      const lastPart = parts.at(-1) ?? "";

      if (
        gap > gapThreshold &&
        lastPart.length > 0 &&
        !lastPart.endsWith(" ") &&
        !isPunctuationStart(text)
      ) {
        parts.push(" ");
      }
    }

    parts.push(text);
    previous = item;
  }

  return parts.join("").replace(/\s+([,.;:!?%)\]}])/g, "$1").trim();
}

function extractPdfLines(pageItems: StructuredTextItem[]): PdfLine[] {
  const textItems = pageItems
    .filter((item) => cleanText(item.str).length > 0)
    .sort((a, b) => {
      const yDifference = b.y - a.y;

      return Math.abs(yDifference) > 1 ? yDifference : a.x - b.x;
    });

  const yTolerance = Math.max(2, median(textItems.map((item) => item.fontSize)) * 0.35);
  const grouped: StructuredTextItem[][] = [];

  for (const item of textItems) {
    const group = grouped.find(
      (candidate) => Math.abs(candidate[0].y - item.y) <= yTolerance,
    );

    if (group) {
      group.push(item);
    } else {
      grouped.push([item]);
    }
  }

  return grouped
    .map((group): PdfLine | null => {
      const text = joinLineItems(group);

      if (!text) {
        return null;
      }

      return {
        text,
        x: Math.min(...group.map((item) => item.x)),
        y: median(group.map((item) => item.y)),
        fontSize: median(group.map((item) => item.fontSize)),
        height: median(group.map((item) => item.height)),
      };
    })
    .filter((line): line is PdfLine => line !== null)
    .sort((a, b) => {
      const yDifference = b.y - a.y;

      return Math.abs(yDifference) > yTolerance ? yDifference : a.x - b.x;
    });
}

function isBulletLine(text: string): boolean {
  return /^([•●▪◦*+-]|\d{1,2}[.)])\s+/.test(text);
}

function stripBullet(text: string): string {
  return text.replace(/^([•●▪◦*+-]|\d{1,2}[.)])\s+/, "").trim();
}

function isLikelyHeading(line: PdfLine, bodyFontSize: number): boolean {
  const text = line.text.trim();

  if (text.length < 3 || text.length > 90 || isBulletLine(text)) {
    return false;
  }

  const hasSentenceEnding = /[.!?]$/.test(text);
  const alpha = text.replace(/[^A-Za-z]/g, "");
  const upper = text.replace(/[^A-Z]/g, "");
  const upperRatio = alpha.length > 0 ? upper.length / alpha.length : 0;
  const isAllCapsLike = upperRatio >= 0.75 && alpha.length >= 4;
  const isFontProminent = bodyFontSize > 0 && line.fontSize >= bodyFontSize * 1.16;

  return isFontProminent || (isAllCapsLike && !hasSentenceEnding);
}

function shouldStartNewParagraph(
  previous: PdfLine,
  current: PdfLine,
  medianLineHeight: number,
): boolean {
  const verticalGap = Math.abs(previous.y - current.y);
  const largeGap = verticalGap > Math.max(medianLineHeight * 1.65, previous.height * 1.65, 16);
  const currentIndented = current.x > previous.x + 18;
  const previousLooksComplete = /[.!?:;)]$/.test(previous.text);

  return largeGap || (currentIndented && previousLooksComplete);
}

function addBlock(blocks: PdfBlock[], block: PdfBlock | null): void {
  if (!block) {
    return;
  }

  if (block.type === "paragraph" && block.lines.length === 0) {
    return;
  }

  if (block.type === "list" && block.items.length === 0) {
    return;
  }

  blocks.push(block);
}

function pageLinesToBlocks(lines: PdfLine[]): PdfBlock[] {
  if (lines.length === 0) {
    return [];
  }

  const bodyFontSize = median(lines.map((line) => line.fontSize));
  const medianLineHeight =
    median(lines.slice(1).map((line, index) => Math.abs(lines[index].y - line.y))) ||
    median(lines.map((line) => line.height)) ||
    bodyFontSize ||
    12;
  const largestFontSize = Math.max(...lines.map((line) => line.fontSize));
  const blocks: PdfBlock[] = [];
  let currentParagraph: PdfLine[] = [];
  let currentList: string[] = [];

  const flushParagraph = (): void => {
    if (currentParagraph.length === 0) {
      return;
    }

    addBlock(blocks, {
      type: "paragraph",
      lines: currentParagraph.map((line) => line.text),
    });
    currentParagraph = [];
  };

  const flushList = (): void => {
    if (currentList.length === 0) {
      return;
    }

    addBlock(blocks, { type: "list", items: currentList });
    currentList = [];
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    if (isLikelyHeading(line, bodyFontSize)) {
      flushParagraph();
      flushList();
      addBlock(blocks, {
        type: "heading",
        level: line.fontSize >= largestFontSize * 0.96 && line.fontSize > bodyFontSize
          ? 1
          : 2,
        text: line.text,
      });
      continue;
    }

    if (isBulletLine(line.text)) {
      flushParagraph();
      currentList.push(stripBullet(line.text));
      continue;
    }

    if (currentList.length > 0) {
      const previousLine = lines[lineIndex - 1];
      const likelyContinuation =
        previousLine && !isLikelyHeading(line, bodyFontSize) && line.x > previousLine.x + 12;

      if (likelyContinuation) {
        currentList[currentList.length - 1] = `${currentList.at(-1)} ${line.text}`;
        continue;
      }

      flushList();
    }

    const previousParagraphLine = currentParagraph.at(-1);

    if (
      previousParagraphLine &&
      shouldStartNewParagraph(previousParagraphLine, line, medianLineHeight)
    ) {
      flushParagraph();
    }

    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function blockToMarkdown(block: PdfBlock): string {
  if (block.type === "heading") {
    return `${"#".repeat(block.level)} ${block.text}`;
  }

  if (block.type === "list") {
    return block.items.map((item) => `- ${item}`).join("\n");
  }

  return block.lines.join(" ");
}

function blockToPlainText(block: PdfBlock): string {
  if (block.type === "list") {
    return block.items.join("\n");
  }

  if (block.type === "paragraph") {
    return block.lines.join(" ");
  }

  return block.text;
}

export function reconstructPdfTextItems(
  pages: StructuredTextItem[][],
): ReconstructedPdf {
  const markdownPages: string[] = [];
  const plainTextPages: string[] = [];
  let itemCount = 0;
  let lineCount = 0;

  for (const pageItems of pages) {
    itemCount += pageItems.length;
    const lines = extractPdfLines(pageItems);
    lineCount += lines.length;
    const blocks = pageLinesToBlocks(lines);
    const markdown = blocks.map(blockToMarkdown).filter(Boolean).join("\n\n");
    const plainText = blocks.map(blockToPlainText).filter(Boolean).join("\n\n");

    if (markdown.trim()) {
      markdownPages.push(markdown);
    }

    if (plainText.trim()) {
      plainTextPages.push(plainText);
    }
  }

  return {
    markdown: normalizeText(markdownPages.join("\n\n---\n\n")).trim(),
    plainText: normalizeText(plainTextPages.join("\n\n")).trim(),
    itemCount,
    lineCount,
  };
}

export async function parsePdf(data: Buffer): Promise<ParsedDocument> {
  let extractedText = "";
  let currentMarkdown = "";
  let pageCount = 0;
  let itemCount = 0;
  let lineCount = 0;

  try {
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const itemResult = await extractTextItems(pdf);

    pageCount = itemResult.totalPages ?? 0;
    const reconstructed = reconstructPdfTextItems(itemResult.items);
    extractedText = reconstructed.plainText;
    currentMarkdown = reconstructed.markdown;
    itemCount = reconstructed.itemCount;
    lineCount = reconstructed.lineCount;

    if (!extractedText || !currentMarkdown) {
      const fallback = await extractText(pdf, { mergePages: false });
      const fallbackPages = fallback.text.map((page) => cleanText(page));

      pageCount = fallback.totalPages ?? pageCount;
      extractedText = normalizeText(fallbackPages.filter(Boolean).join("\n\n")).trim();
      currentMarkdown = extractedText;
    }
  } catch (error) {
    console.error("[parsing/pdf]", error);
    throw new Error("Could not read this PDF file.");
  }

  return {
    extractedText,
    editorJson: currentMarkdown
      ? markdownToEditorJson(currentMarkdown)
      : plainTextToEditorJson(extractedText),
    currentMarkdown,
    formattingMetadata: {
      format: "pdf",
      pageCount,
      extraction: "coordinate-text-items",
      itemCount,
      lineCount,
    },
    wordCount: countWords(extractedText),
    fidelityStatus: "Original Preserved",
    warnings: [
      "PDF layout is reconstructed from positioned text and may be limited in the editor. Your original file is preserved.",
    ],
  };
}
