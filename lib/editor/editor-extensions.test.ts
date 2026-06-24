import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";

import { editorExtensions } from "@/lib/editor/editor-extensions";

// Exercises every wired toolbar command against the shared editor config so we
// can verify the editor features produce the expected document output without a
// browser. This mirrors what the toolbar buttons call in EditorToolbar.
let editor: Editor;

function makeEditor(content = "<p>Hello world</p>"): Editor {
  return new Editor({
    element: document.createElement("div"),
    extensions: editorExtensions,
    content,
  });
}

beforeEach(() => {
  editor = makeEditor();
  editor.commands.selectAll();
});

afterEach(() => {
  editor.destroy();
});

describe("editor formatting marks", () => {
  it("applies bold", () => {
    editor.chain().focus().toggleBold().run();
    expect(editor.isActive("bold")).toBe(true);
    expect(editor.getHTML()).toContain("<strong>");
  });

  it("applies italic", () => {
    editor.chain().focus().toggleItalic().run();
    expect(editor.isActive("italic")).toBe(true);
    expect(editor.getHTML()).toContain("<em>");
  });

  it("applies underline", () => {
    editor.chain().focus().toggleUnderline().run();
    expect(editor.isActive("underline")).toBe(true);
    expect(editor.getHTML()).toContain("<u>");
  });

  it("applies inline code", () => {
    editor.chain().focus().toggleCode().run();
    expect(editor.isActive("code")).toBe(true);
    expect(editor.getHTML()).toContain("<code>");
  });

  it("applies highlight", () => {
    editor.chain().focus().toggleHighlight().run();
    expect(editor.isActive("highlight")).toBe(true);
    expect(editor.getHTML()).toContain("<mark");
  });
});

describe("editor text style", () => {
  it("sets text color", () => {
    editor.chain().focus().setColor("#ff0000").run();
    expect(editor.getAttributes("textStyle").color).toBe("#ff0000");
    expect(editor.getHTML()).toContain("color");
  });

  it("sets font family", () => {
    editor.chain().focus().setFontFamily("Georgia, serif").run();
    expect(editor.getAttributes("textStyle").fontFamily).toBe("Georgia, serif");
  });

  it("sets font size", () => {
    editor.chain().focus().setFontSize("24px").run();
    expect(editor.getAttributes("textStyle").fontSize).toBe("24px");
  });
});

describe("editor blocks and alignment", () => {
  it("sets a heading", () => {
    editor.chain().focus().setHeading({ level: 2 }).run();
    expect(editor.getHTML()).toContain("<h2");
  });

  it("returns to a paragraph", () => {
    editor.chain().focus().setHeading({ level: 1 }).run();
    expect(editor.getHTML()).toContain("<h1");
    editor.chain().focus().setParagraph().run();
    expect(editor.getHTML()).toContain("<p");
    expect(editor.getHTML()).not.toContain("<h1");
  });

  it("toggles a bullet list", () => {
    editor.chain().focus().toggleBulletList().run();
    expect(editor.getHTML()).toContain("<ul>");
  });

  it("toggles an ordered list", () => {
    editor.chain().focus().toggleOrderedList().run();
    expect(editor.getHTML()).toContain("<ol>");
  });

  it("aligns text to center", () => {
    editor.chain().focus().setTextAlign("center").run();
    expect(editor.isActive({ textAlign: "center" })).toBe(true);
    expect(editor.getHTML()).toContain("text-align: center");
  });
});

describe("editor rich document nodes", () => {
  it("sets and unsets links", () => {
    editor.chain().focus().setLink({ href: "https://example.com" }).run();
    expect(editor.isActive("link")).toBe(true);
    expect(editor.getHTML()).toContain("https://example.com");

    editor.chain().focus().unsetLink().run();
    expect(editor.isActive("link")).toBe(false);
  });

  it("inserts an image", () => {
    const imageEditor = makeEditor("<p></p>");
    imageEditor
      .chain()
      .focus()
      .setImage({ src: "data:image/png;base64,abc", alt: "Preview" })
      .run();

    expect(imageEditor.getHTML()).toContain("<img");
    imageEditor.destroy();
  });

  it("inserts a table", () => {
    const tableEditor = makeEditor("<p></p>");
    tableEditor
      .chain()
      .focus()
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run();

    expect(tableEditor.getHTML()).toContain("<table");
    tableEditor.destroy();
  });
});

describe("editor markdown serialization", () => {
  it("serializes headings and bold to real markdown", () => {
    const md = makeEditor(
      "<h1>Title</h1><p>Some <strong>bold</strong> text</p>",
    );
    const output = md.getMarkdown();
    md.destroy();

    expect(output).toContain("# Title");
    expect(output).toContain("**bold**");
  });

  it("serializes bullet lists to markdown", () => {
    const md = makeEditor("<ul><li>First</li><li>Second</li></ul>");
    const output = md.getMarkdown();
    md.destroy();

    expect(output).toContain("First");
    expect(output).toContain("Second");
    expect(output).toMatch(/[-*]\s/);
  });
});

describe("editor history", () => {
  it("undoes and redoes a change", () => {
    const before = editor.getHTML();
    editor.chain().focus().toggleBold().run();
    expect(editor.getHTML()).not.toBe(before);
    editor.chain().focus().undo().run();
    expect(editor.getHTML()).toBe(before);
    editor.chain().focus().redo().run();
    expect(editor.isActive("bold")).toBe(true);
  });
});
