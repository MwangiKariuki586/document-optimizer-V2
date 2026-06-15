import { forwardRef } from "react";
import { FileText, Info } from "lucide-react";

type ReadOnlyCurrentDocumentProps = {
  markdown: string;
  wordCount: number;
  characterCount: number;
  hidden?: boolean;
  onScroll?: () => void;
};

export const ReadOnlyCurrentDocument = forwardRef<
  HTMLDivElement,
  ReadOnlyCurrentDocumentProps
>(function ReadOnlyCurrentDocument(
  { markdown, wordCount, characterCount, hidden, onScroll },
  ref,
) {
  return (
    <article
      className={`min-w-0 rounded-xl border border-border bg-surface shadow-card-soft ${
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
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-text-primary">
            {markdown || "No current document content available."}
          </pre>
        </div>
      </div>
      <footer className="flex shrink-0 items-center gap-5 border-t border-border-light px-4 py-3 text-xs font-medium text-text-secondary">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{characterCount.toLocaleString()} characters</span>
      </footer>
    </article>
  );
});
