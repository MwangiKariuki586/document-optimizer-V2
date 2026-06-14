import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Markdown } from "@tiptap/markdown";

// Single source of truth for the document editor extension set, shared by the
// editor workspace component and the editor command tests.
// Markdown enables bidirectional Markdown via editor.getMarkdown(), so we can
// persist real Markdown to current_markdown instead of plain text.
export const editorExtensions: Extensions = [
  StarterKit,
  TextStyleKit,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Markdown,
];
