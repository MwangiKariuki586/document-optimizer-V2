import { forwardRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { FileText, Info } from "lucide-react";

import { isEditorJson } from "@/lib/documents/editor-json";
import { editorExtensions } from "@/lib/editor/editor-extensions";
import type { Json } from "@/lib/supabase/types";

type ReadOnlyCurrentDocumentProps = {
  markdown: string;
  editorJson?: Json | null;
  wordCount: number;
  characterCount: number;
  hidden?: boolean;
  onScroll?: () => void;
};

export const ReadOnlyCurrentDocument = forwardRef<
  HTMLDivElement,
  ReadOnlyCurrentDocumentProps
>(function ReadOnlyCurrentDocument(
  { markdown, editorJson, wordCount, characterCount, hidden, onScroll },
  ref,
) {
  const richContent = isEditorJson(editorJson) ? editorJson : null;
  const editor = useEditor({
    extensions: editorExtensions,
    content: richContent ?? markdown,
    contentType: richContent ? undefined : "markdown",
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ProseMirror-doc focus:outline-none",
      },
    },
  });

  return (
    <article
      className={`min-w-0 rounded-xl border border-border bg-surface  ${
        hidden ? "hidden" : "flex min-h-0 flex-col"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="size-4 text-text-muted" />
          Current document
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-surface-tertiary px-2 py-1 text-[11px] font-medium text-text-muted">
            Read-only
          </span>
          <Info className="size-4 text-text-muted" />
        </div>
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="min-h-[360px] flex-1 overflow-y-auto bg-surface-secondary xl:min-h-0"
      >
        <div className="document-editor min-h-[320px] w-full bg-surface px-5 py-6 md:px-7 md:py-7 xl:min-h-0">
          {markdown || editorJson ? (
            <EditorContent editor={editor} className="min-h-[320px]" />
          ) : (
            <p className="text-sm leading-7 text-text-secondary">
              No current document content available.
            </p>
          )}
        </div>
      </div>
      <footer className="flex shrink-0 items-center gap-5 border-t border-border-light px-4 py-3 text-xs font-medium text-text-secondary">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{characterCount.toLocaleString()} characters</span>
      </footer>
    </article>
  );
});
