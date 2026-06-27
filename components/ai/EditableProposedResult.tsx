"use client";

import { forwardRef, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Sparkles } from "lucide-react";

import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import { isEditorJson } from "@/lib/documents/editor-json";
import { editorExtensions } from "@/lib/editor/editor-extensions";
import {
  findSuggestionHighlightRanges,
  SuggestionHighlight,
} from "@/lib/editor/suggestion-highlight";
import type { Json } from "@/lib/supabase/types";

type EditableProposedResultProps = {
  initialMarkdown: string;
  initialEditorJson?: Json | null;
  emptyText: string;
  wordCount: number;
  characterCount: number;
  changes: PreviewChangeAnchor[];
  activeChangeId: string | null;
  onSelectChange?: (changeId: string) => void;
  onScroll?: () => void;
};

export const EditableProposedResult = forwardRef<
  HTMLDivElement,
  EditableProposedResultProps
>(function EditableProposedResult(
  {
    initialMarkdown,
    initialEditorJson,
    emptyText,
    wordCount,
    characterCount,
    changes,
    activeChangeId,
    onSelectChange,
    onScroll,
  },
  ref,
) {
  const richInitialContent = isEditorJson(initialEditorJson)
    ? initialEditorJson
    : null;
  const previewEditorExtensions = useMemo(
    () => [
      ...editorExtensions,
      SuggestionHighlight.configure({ onHighlightClick: onSelectChange }),
    ],
    [onSelectChange],
  );

  const editor = useEditor({
    extensions: previewEditorExtensions,
    content: richInitialContent ?? initialMarkdown,
    contentType: richInitialContent ? undefined : "markdown",
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
        originalText: change.suggestedText,
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
    <article className="flex min-h-0 min-w-0 flex-col rounded-xl border border-border bg-surface">
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          <Sparkles className="size-4" />
          Proposed result
        </h2>
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
      </footer>
    </article>
  );
});
