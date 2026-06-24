import { MarkdownManager } from "@tiptap/markdown";

import {
  editorJsonToPlainText,
  isEditorJson,
  toJson,
} from "@/lib/documents/editor-json";
import { plainTextToEditorJson } from "@/lib/documents/text-to-editor";
import { schemaExtensions } from "@/lib/editor/editor-extensions";
import type { Json } from "@/lib/supabase/types";

const markdownManager = new MarkdownManager({
  extensions: schemaExtensions,
});

export function markdownToEditorJson(markdown: string): Json {
  const parsed = markdownManager.parse(markdown);

  if (!isEditorJson(parsed)) {
    return plainTextToEditorJson(markdown);
  }

  return toJson(parsed);
}

export function editorJsonToMarkdown(editorJson: unknown): string {
  if (!isEditorJson(editorJson)) {
    return "";
  }

  return markdownManager.serialize(editorJson);
}

export function markdownToPlainText(markdown: string): string {
  return editorJsonToPlainText(markdownToEditorJson(markdown));
}
