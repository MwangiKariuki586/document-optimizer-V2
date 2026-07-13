import { forwardRef, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { FileText, Info } from "lucide-react";

import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import { isEditorJson } from "@/lib/documents/editor-json";
import { editorExtensions } from "@/lib/editor/editor-extensions";
import {
  findSuggestionHighlightRanges,
  SuggestionHighlight,
} from "@/lib/editor/suggestion-highlight";
import type { Json } from "@/lib/supabase/types";

type ReadOnlyCurrentDocumentProps = {
  markdown: string;
  editorJson?: Json | null;
  wordCount: number;
  characterCount: number;
  changes: PreviewChangeAnchor[];
  activeChangeId: string | null;
  hidden?: boolean;
  onSelectChange?: (changeId: string) => void;
  onScroll?: () => void;
};

export const ReadOnlyCurrentDocument = forwardRef<
  HTMLDivElement,
  ReadOnlyCurrentDocumentProps
>(function ReadOnlyCurrentDocument(
  {
    markdown,
    editorJson,
    wordCount,
    characterCount,
    changes,
    activeChangeId,
    hidden,
    onSelectChange,
    onScroll,
  },
  ref,
) {
  const richContent = isEditorJson(editorJson) ? editorJson : null;
  const previewEditorExtensions = useMemo(
    () => [
      ...editorExtensions,
      SuggestionHighlight.configure({ onHighlightClick: onSelectChange }),
    ],
    [onSelectChange],
  );
  const editor = useEditor({
    extensions: previewEditorExtensions,
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

  useEffect(() => {
    if (!editor) {
      return;
    }

    const ranges = findSuggestionHighlightRanges(
      editor.state.doc,
      changes.map((change) => ({
        id: change.id,
        originalText: change.originalText,
        category: change.type,
        issueLabel: change.explanation || change.label,
      })),
    );

    editor.commands.setSuggestionHighlights(ranges);
  }, [changes, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setActiveSuggestionHighlight(activeChangeId);
  }, [activeChangeId, editor]);

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
        role="region"
        aria-label="Current document content"
        tabIndex={0}
        className="min-h-0 flex-1 touch-pan-y overflow-y-scroll overscroll-contain bg-surface-secondary"
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
