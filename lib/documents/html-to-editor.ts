import { generateHTML, generateJSON } from "@tiptap/html/server";

import { isEditorJson, toJson } from "@/lib/documents/editor-json";
import { plainTextToEditorJson } from "@/lib/documents/text-to-editor";
import { schemaExtensions } from "@/lib/editor/editor-extensions";
import type { Json } from "@/lib/supabase/types";

function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/giu, "\n")
    .replace(/<[^>]+>/gu, "")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .trim();
}

export function htmlToEditorJson(html: string): Json {
  const parsed: unknown = generateJSON(html, schemaExtensions);

  if (!isEditorJson(parsed)) {
    return plainTextToEditorJson(stripHtmlToText(html));
  }

  return toJson(parsed);
}

export function tryHtmlToEditorJson(html: string): Json | null {
  try {
    return htmlToEditorJson(html);
  } catch (error) {
    console.error("[documents/html-to-editor]", error);
    return null;
  }
}

export function editorJsonToHtml(editorJson: unknown): string {
  if (!isEditorJson(editorJson)) {
    return "";
  }

  return generateHTML(editorJson, schemaExtensions);
}
