"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Maximize,
  MinusCircle,
  PencilLine,
  PlusCircle,
  Redo2,
  Sparkles,
  Undo2,
} from "lucide-react";

import { isEditorJson } from "@/lib/documents/editor-json";
import { editorExtensions } from "@/lib/editor/editor-extensions";
import type { Json } from "@/lib/supabase/types";

type EditableProposedResultProps = {
  initialMarkdown: string;
  initialEditorJson?: Json | null;
  emptyText: string;
  edited: boolean;
  wordCount: number;
  characterCount: number;
  onMarkdownChange: (markdown: string) => void;
  onEditedChange: (edited: boolean) => void;
  onScroll?: () => void;
};

function normalizeMarkdown(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export const EditableProposedResult = forwardRef<
  HTMLDivElement,
  EditableProposedResultProps
>(function EditableProposedResult(
  {
    initialMarkdown,
    initialEditorJson,
    emptyText,
    edited,
    wordCount,
    characterCount,
    onMarkdownChange,
    onEditedChange,
    onScroll,
  },
  ref,
) {
  const normalizedInitial = useMemo(
    () => normalizeMarkdown(initialMarkdown),
    [initialMarkdown],
  );
  const richInitialContent = isEditorJson(initialEditorJson)
    ? initialEditorJson
    : null;

  const editor = useEditor({
    extensions: editorExtensions,
    content: richInitialContent ?? initialMarkdown,
    contentType: richInitialContent ? undefined : "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ProseMirror-doc focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const markdown = instance.getMarkdown();
      onMarkdownChange(markdown);
      onEditedChange(normalizeMarkdown(markdown) !== normalizedInitial);
    },
  });
  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  useEffect(() => {
    if (!editor) {
      return;
    }

    const markdown = editor.getMarkdown();
    onMarkdownChange(markdown);
    onEditedChange(normalizeMarkdown(markdown) !== normalizedInitial);
  }, [editor, normalizedInitial, onEditedChange, onMarkdownChange]);

  return (
    <article className="flex min-h-0 min-w-0 flex-col rounded-xl border border-border bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          <Sparkles className="size-4" />
          Proposed result
        </h2>
        <div className="flex items-center gap-2">
          {edited ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-ai-light px-2 py-1 text-[11px] font-semibold text-ai-dark">
              <PencilLine className="size-3.5" />
              Edited preview
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!canUndo}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-soft disabled:hover:bg-transparent"
            aria-label="Undo proposed edit"
            title="Undo"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!canRedo}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-soft disabled:hover:bg-transparent"
            aria-label="Redo proposed edit"
            title="Redo"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="min-h-[360px] flex-1 overflow-y-auto bg-surface-secondary xl:min-h-0"
      >
        <div className="document-editor min-h-[320px] w-full bg-surface px-5 py-6 md:px-7 md:py-7 xl:min-h-0">
          {!initialMarkdown ? (
            <p className="mb-4 rounded-lg bg-ai-muted px-3 py-2 text-xs leading-5 text-ai-dark">
              {emptyText}
            </p>
          ) : null}
          <EditorContent editor={editor} className="min-h-[320px]" />
        </div>
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border-light px-4 py-3 text-xs font-medium text-text-secondary">
        <div className="flex items-center gap-5">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{characterCount.toLocaleString()} characters</span>
        </div>
        <div className="flex items-center gap-3 text-text-muted">
          <span>100%</span>
          <MinusCircle className="size-4" />
          <PlusCircle className="size-4" />
          <Maximize className="size-4" />
        </div>
      </footer>
    </article>
  );
});
