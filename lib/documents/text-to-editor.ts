import type { Json } from "@/lib/supabase/types";

export function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function countWords(text: string): number {
  const trimmed = text.trim();

  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Converts plain pasted text into a TipTap-compatible document: one paragraph per
// line, with blank lines preserved as empty paragraphs. Treated as Plain Text Only
// fidelity since no rich structure is inferred.
export function plainTextToEditorJson(text: string): Json {
  const lines = normalizeText(text).split("\n");

  const content = lines.map((line) => {
    if (line.trim().length === 0) {
      return { type: "paragraph" };
    }

    return {
      type: "paragraph",
      content: [{ type: "text", text: line }],
    };
  });

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}
