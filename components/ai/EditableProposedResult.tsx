"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { PencilLine, Sparkles } from "lucide-react";

import { editorExtensions } from "@/lib/editor/editor-extensions";

type EditableProposedResultProps = {
  initialMarkdown: string;
  emptyText: string;
  edited: boolean;
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
    emptyText,
    edited,
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

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialMarkdown,
    contentType: "markdown",
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

  useEffect(() => {
    if (!editor) {
      return;
    }

    const markdown = editor.getMarkdown();
    onMarkdownChange(markdown);
    onEditedChange(normalizeMarkdown(markdown) !== normalizedInitial);
  }, [editor, normalizedInitial, onEditedChange, onMarkdownChange]);

  return (
    <article className="flex min-w-0 min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          <Sparkles className="size-4" />
          Proposed result
        </h2>
        <div className="flex items-center gap-2">
          {edited ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-light px-2 py-0.5 text-xs font-semibold text-ai-dark">
              <PencilLine className="size-3.5" />
              Edited preview
            </span>
          ) : null}
          <span className="rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground">
            Editable
          </span>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="min-h-[360px] flex-1 overflow-y-auto bg-surface-secondary p-4 xl:min-h-0"
      >
        <div className="document-editor mx-auto min-h-[320px] w-full max-w-[720px] rounded-lg border border-border-light bg-surface px-6 py-7 shadow-card-soft md:px-9 md:py-8 xl:min-h-0">
          {!initialMarkdown ? (
            <p className="mb-4 rounded-lg bg-ai-muted px-3 py-2 text-xs leading-5 text-ai-dark">
              {emptyText}
            </p>
          ) : null}
          <EditorContent editor={editor} />
        </div>
      </div>
    </article>
  );
});
