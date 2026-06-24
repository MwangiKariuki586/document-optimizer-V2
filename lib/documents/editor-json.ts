import type { JSONContent } from "@tiptap/core";

import type { Json } from "@/lib/supabase/types";

type EditorMark = {
  type: string;
  attrs?: Record<string, unknown> | null;
};

type EditorNode = {
  type?: string;
  attrs?: Record<string, unknown> | null;
  content?: EditorNode[];
  marks?: EditorMark[];
  text?: string;
};

type TextNodeReference = {
  node: EditorNode;
  start: number;
  end: number;
};

export type TextReplacement = {
  originalText: string;
  suggestedText: string;
};

const BLOCK_NODE_TYPES = new Set([
  "paragraph",
  "heading",
  "blockquote",
  "codeBlock",
  "listItem",
  "tableCell",
  "tableHeader",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isEditorJson(value: unknown): value is JSONContent {
  return isRecord(value) && value.type === "doc";
}

export function cloneEditorJson(value: JSONContent): JSONContent {
  return JSON.parse(JSON.stringify(value)) as JSONContent;
}

function collectTextNodes(
  node: EditorNode,
  references: TextNodeReference[],
  offset: number,
): number {
  if (typeof node.text === "string") {
    const start = offset;
    const end = start + node.text.length;
    references.push({ node, start, end });

    return end;
  }

  return (node.content ?? []).reduce(
    (currentOffset, child) => collectTextNodes(child, references, currentOffset),
    offset,
  );
}

function pruneEmptyTextNodes(node: EditorNode): EditorNode | null {
  if (typeof node.text === "string") {
    return node.text.length > 0 ? node : null;
  }

  if (node.content) {
    node.content = node.content
      .map(pruneEmptyTextNodes)
      .filter((child): child is EditorNode => child !== null);
  }

  return node;
}

function replaceRangeInNodes(
  references: TextNodeReference[],
  start: number,
  end: number,
  replacement: string,
): boolean {
  const touched = references.filter(
    (reference) => reference.end > start && reference.start < end,
  );

  if (touched.length === 0) {
    return false;
  }

  const first = touched[0];
  const last = touched[touched.length - 1];

  for (const reference of touched) {
    const isFirst = reference === first;
    const isLast = reference === last;
    const original = reference.node.text ?? "";
    const before = isFirst ? original.slice(0, start - reference.start) : "";
    const after = isLast ? original.slice(end - reference.start) : "";

    reference.node.text = isFirst ? `${before}${replacement}${after}` : "";
  }

  return true;
}

export function applyTextReplacementsToEditorJson(
  editorJson: unknown,
  replacements: TextReplacement[],
): JSONContent | null {
  if (!isEditorJson(editorJson)) {
    return null;
  }

  let next = cloneEditorJson(editorJson) as EditorNode;

  for (const replacement of replacements) {
    const references: TextNodeReference[] = [];
    collectTextNodes(next, references, 0);
    const plainText = references.map((reference) => reference.node.text).join("");
    const start = plainText.indexOf(replacement.originalText);

    if (start === -1) {
      return null;
    }

    if (
      plainText.indexOf(
        replacement.originalText,
        start + replacement.originalText.length,
      ) !== -1
    ) {
      return null;
    }

    const replaced = replaceRangeInNodes(
      references,
      start,
      start + replacement.originalText.length,
      replacement.suggestedText,
    );

    if (!replaced) {
      return null;
    }

    next = pruneEmptyTextNodes(next) ?? { type: "doc", content: [] };
  }

  return next as JSONContent;
}

function collectPlainText(node: EditorNode, chunks: string[]): void {
  if (typeof node.text === "string") {
    chunks.push(node.text);
    return;
  }

  const isBlock = node.type ? BLOCK_NODE_TYPES.has(node.type) : false;

  if (isBlock && chunks.length > 0 && chunks.at(-1) !== "\n") {
    chunks.push("\n");
  }

  for (const child of node.content ?? []) {
    collectPlainText(child, chunks);
  }

  if (isBlock && chunks.at(-1) !== "\n") {
    chunks.push("\n");
  }
}

export function editorJsonToPlainText(editorJson: unknown): string {
  if (!isEditorJson(editorJson)) {
    return "";
  }

  const chunks: string[] = [];
  collectPlainText(editorJson as EditorNode, chunks);

  return chunks.join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function toJson(value: JSONContent): Json {
  return value as Json;
}
