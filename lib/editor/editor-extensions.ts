import type { Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";

// Single source of truth for the document editor extension set, shared by the
// editor workspace component and the editor command tests.
// Markdown enables bidirectional Markdown via editor.getMarkdown(), so we can
// persist real Markdown to current_markdown instead of plain text.
export const schemaExtensions: Extensions = [
  StarterKit,
  TextStyleKit,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
  Image.configure({ inline: false, allowBase64: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Markdown,
];

export const editorExtensions: Extensions = schemaExtensions;
