import { describe, expect, it } from "vitest";
import type { StructuredTextItem } from "unpdf";

import { editorJsonToHtml } from "@/lib/documents/html-to-editor";
import { markdownToEditorJson } from "@/lib/documents/markdown-to-editor";
import { reconstructPdfTextItems } from "@/lib/parsing/parse-pdf";

function textItem(
  str: string,
  x: number,
  y: number,
  width: number,
  fontSize = 11,
): StructuredTextItem {
  return {
    str,
    x,
    y,
    width,
    height: fontSize,
    fontSize,
    fontFamily: "Helvetica",
    dir: "ltr",
    hasEOL: false,
  };
}

describe("reconstructPdfTextItems", () => {
  it("groups positioned PDF fragments into headings, paragraphs, and lists", () => {
    const reconstructed = reconstructPdfTextItems([
      [
        textItem("Alex Mwangi", 72, 730, 120, 18),
        textItem("PROFILE SUMMARY", 72, 680, 130, 12),
        textItem("Full Stack Engineer with experience building", 72, 640, 260),
        textItem("and improving products across backend.", 72, 626, 250),
        textItem("WORK EXPERIENCE", 72, 580, 130, 12),
        textItem("•", 92, 542, 8),
        textItem("Developed responsive UIs for client portals.", 112, 542, 260),
        textItem("•", 92, 520, 8),
        textItem("Improved load times by 30%.", 112, 520, 190),
      ],
    ]);

    expect(reconstructed.markdown).toContain("# Alex Mwangi");
    expect(reconstructed.markdown).toContain("## PROFILE SUMMARY");
    expect(reconstructed.markdown).toContain(
      "Full Stack Engineer with experience building and improving products across backend.",
    );
    expect(reconstructed.markdown).toContain(
      "- Developed responsive UIs for client portals.",
    );
    expect(reconstructed.markdown).not.toContain("\n\n\n");
  });

  it("creates structured editor JSON from reconstructed PDF markdown", () => {
    const reconstructed = reconstructPdfTextItems([
      [
        textItem("PROFILE SUMMARY", 72, 680, 130, 12),
        textItem("•", 92, 642, 8),
        textItem("Built reliable product workflows.", 112, 642, 220),
      ],
    ]);
    const html = editorJsonToHtml(markdownToEditorJson(reconstructed.markdown));

    expect(html).toContain("<h");
    expect(html).toContain("<ul");
    expect(html).toContain("Built reliable product workflows.");
  });

  it("keeps indented wrapped bullet text inside the same list item", () => {
    const reconstructed = reconstructPdfTextItems([
      [
        textItem("•", 92, 642, 8),
        textItem("Created reusable React components for platform", 112, 642, 300),
        textItem("customization workflows.", 126, 628, 180),
      ],
    ]);

    expect(reconstructed.markdown).toContain(
      "- Created reusable React components for platform customization workflows.",
    );
  });
});
