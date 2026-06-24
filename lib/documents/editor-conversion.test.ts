import { describe, expect, it } from "vitest";

import {
  applyTextReplacementsToEditorJson,
  editorJsonToPlainText,
  isEditorJson,
} from "@/lib/documents/editor-json";
import { htmlToEditorJson, editorJsonToHtml } from "@/lib/documents/html-to-editor";
import {
  editorJsonToMarkdown,
  markdownToEditorJson,
  markdownToPlainText,
} from "@/lib/documents/markdown-to-editor";

describe("rich editor conversion", () => {
  it("converts HTML structure into TipTap JSON", () => {
    const editorJson = htmlToEditorJson(
      [
        "<h1>Profile Summary</h1>",
        "<p>Some <strong>bold</strong> text with <a href=\"https://example.com\">a link</a>.</p>",
        "<ul><li>First</li><li>Second</li></ul>",
        "<table><tr><th>Role</th></tr><tr><td>Developer</td></tr></table>",
      ].join(""),
    );

    expect(isEditorJson(editorJson)).toBe(true);
    expect(editorJsonToHtml(editorJson)).toContain("<h1");
    expect(editorJsonToHtml(editorJson)).toContain("<strong");
    expect(editorJsonToHtml(editorJson)).toContain("<a");
    expect(editorJsonToHtml(editorJson)).toContain("<table");
  });

  it("converts Markdown into structured editor JSON", () => {
    const editorJson = markdownToEditorJson(
      "# Heading\n\n- First\n- Second\n\nA **bold** phrase.",
    );
    const html = editorJsonToHtml(editorJson);

    expect(html).toContain("<h1");
    expect(html).toContain("<ul");
    expect(html).toContain("<strong");
    expect(editorJsonToMarkdown(editorJson)).toContain("# Heading");
  });

  it("maps markdown snippets to plain text for rich replacement anchors", () => {
    expect(markdownToPlainText("A **bold** [link](https://example.com)")).toBe(
      "A bold link",
    );
  });
});

describe("rich editor text replacement", () => {
  it("replaces text without removing surrounding marks or nodes", () => {
    const editorJson = htmlToEditorJson(
      "<h1>Title</h1><p>Improve <strong>this sentence</strong> today.</p>",
    );

    const next = applyTextReplacementsToEditorJson(editorJson, [
      {
        originalText: "this sentence",
        suggestedText: "this stronger sentence",
      },
    ]);

    expect(next).not.toBeNull();
    expect(editorJsonToHtml(next)).toContain("<h1");
    expect(editorJsonToHtml(next)).toContain("<strong");
    expect(editorJsonToPlainText(next)).toContain("this stronger sentence");
  });

  it("rejects ambiguous rich replacements", () => {
    const editorJson = htmlToEditorJson("<p>Repeat</p><p>Repeat</p>");

    expect(
      applyTextReplacementsToEditorJson(editorJson, [
        { originalText: "Repeat", suggestedText: "Changed" },
      ]),
    ).toBeNull();
  });
});
