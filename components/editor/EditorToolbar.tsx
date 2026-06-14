import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  ChevronDown,
  Code2,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

type EditorToolbarProps = {
  editor: Editor | null;
};

const toolButtonClass =
  "flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary";

const activeToolButtonClass = "bg-accent-light text-accent";

const selectClass =
  "h-7 cursor-pointer appearance-none rounded-md border border-border-light bg-surface pl-2 pr-6 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent";

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex shrink-0 items-center">
      {children}
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-text-muted" />
    </span>
  );
}

const FONT_FAMILIES = [
  // Inter is the app font loaded via next/font and exposed as --font-sans,
  // so selecting "Inter" reuses the exact same stack the rest of the app renders.
  { label: "Inter", value: "var(--font-sans)" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Courier", value: "'Courier New', monospace" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "30px"];

function Divider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-border" />;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const buttonClass = (isActive: boolean) =>
    `${toolButtonClass} ${isActive ? activeToolButtonClass : ""}`;

  const currentBlock = editor?.isActive("heading", { level: 1 })
    ? "h1"
    : editor?.isActive("heading", { level: 2 })
      ? "h2"
      : editor?.isActive("heading", { level: 3 })
        ? "h3"
        : "paragraph";

  const currentFontFamily =
    (editor?.getAttributes("textStyle").fontFamily as string | undefined) ?? "";
  const currentFontSize =
    (editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  const handleBlockChange = (value: string) => {
    if (!editor) {
      return;
    }

    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = Number(value.replace("h", "")) as 1 | 2 | 3;
    editor.chain().focus().setHeading({ level }).run();
  };

  const handleFontFamilyChange = (value: string) => {
    if (!editor) {
      return;
    }

    if (value === "") {
      editor.chain().focus().unsetFontFamily().run();
      return;
    }

    editor.chain().focus().setFontFamily(value).run();
  };

  const handleFontSizeChange = (value: string) => {
    if (!editor) {
      return;
    }

    if (value === "") {
      editor.chain().focus().unsetFontSize().run();
      return;
    }

    editor.chain().focus().setFontSize(value).run();
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-t border-border-light px-3 py-1.5">
      <label className="sr-only" htmlFor="editor-block-type">
        Text style
      </label>
      <SelectShell>
        <select
          id="editor-block-type"
          className={selectClass}
          value={currentBlock}
          onChange={(event) => handleBlockChange(event.target.value)}
        >
          <option value="paragraph">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </SelectShell>

      <label className="sr-only" htmlFor="editor-font-family">
        Font family
      </label>
      <SelectShell>
        <select
          id="editor-font-family"
          className={selectClass}
          value={currentFontFamily}
          onChange={(event) => handleFontFamilyChange(event.target.value)}
        >
          <option value="">Inter</option>
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </SelectShell>

      <label className="sr-only" htmlFor="editor-font-size">
        Font size
      </label>
      <SelectShell>
        <select
          id="editor-font-size"
          className={selectClass}
          value={currentFontSize}
          onChange={(event) => handleFontSizeChange(event.target.value)}
        >
          <option value="">11</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size.replace("px", "")}
            </option>
          ))}
        </select>
      </SelectShell>

      <Divider />

      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("bold")))}
        title="Bold"
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("italic")))}
        title="Italic"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("underline")))}
        title="Underline"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <Underline className="size-4" />
      </button>

      <label
        className={`${toolButtonClass} relative cursor-pointer`}
        title="Text color"
      >
        <Baseline className="size-4" />
        <input
          type="color"
          className="sr-only"
          aria-label="Text color"
          onChange={(event) =>
            editor?.chain().focus().setColor(event.target.value).run()
          }
        />
      </label>
      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("highlight")))}
        title="Highlight"
        onClick={() => editor?.chain().focus().toggleHighlight().run()}
      >
        <Highlighter className="size-4" />
      </button>

      <Divider />

      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("bulletList")))}
        title="Bullet list"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("orderedList")))}
        title="Numbered list"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </button>
      <button
        type="button"
        className={toolButtonClass}
        title="Decrease indent"
        onClick={() => editor?.chain().focus().liftListItem("listItem").run()}
      >
        <IndentDecrease className="size-4" />
      </button>
      <button
        type="button"
        className={toolButtonClass}
        title="Increase indent"
        onClick={() => editor?.chain().focus().sinkListItem("listItem").run()}
      >
        <IndentIncrease className="size-4" />
      </button>

      <Divider />

      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive({ textAlign: "left" })))}
        title="Align left"
        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(
          Boolean(editor?.isActive({ textAlign: "center" })),
        )}
        title="Align center"
        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(
          Boolean(editor?.isActive({ textAlign: "right" })),
        )}
        title="Align right"
        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="size-4" />
      </button>
      <button
        type="button"
        className={buttonClass(
          Boolean(editor?.isActive({ textAlign: "justify" })),
        )}
        title="Justify"
        onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="size-4" />
      </button>

      <Divider />

      <button
        type="button"
        className={buttonClass(Boolean(editor?.isActive("code")))}
        title="Inline code"
        onClick={() => editor?.chain().focus().toggleCode().run()}
      >
        <Code2 className="size-4" />
      </button>
    </div>
  );
}
