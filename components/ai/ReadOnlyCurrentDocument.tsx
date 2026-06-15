import { forwardRef } from "react";
import { FileText } from "lucide-react";

type ReadOnlyCurrentDocumentProps = {
  markdown: string;
  hidden?: boolean;
  onScroll?: () => void;
};

export const ReadOnlyCurrentDocument = forwardRef<
  HTMLDivElement,
  ReadOnlyCurrentDocumentProps
>(function ReadOnlyCurrentDocument({ markdown, hidden, onScroll }, ref) {
  return (
    <article
      className={`min-w-0 border-b border-border-light lg:border-b-0 lg:border-r ${
        hidden ? "hidden" : "flex min-h-0 flex-col"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="size-4 text-text-muted" />
          Current document
        </h2>
        <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-xs font-medium text-text-muted">
          Read-only
        </span>
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="min-h-[360px] flex-1 overflow-y-auto bg-surface-secondary p-4 xl:min-h-0"
      >
        <div className="document-editor mx-auto min-h-[320px] w-full max-w-[720px] rounded-lg border border-border-light bg-surface px-6 py-7 shadow-card-soft md:px-9 md:py-8 xl:min-h-0">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-text-primary">
            {markdown || "No current document content available."}
          </pre>
        </div>
      </div>
    </article>
  );
});
