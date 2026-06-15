import Link from "next/link";
import { Clipboard, RotateCcw, Sparkles, Undo2 } from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";

type PreviewActionBarProps = {
  documentId: string;
  canApply: boolean;
  edited: boolean;
  isApplying: boolean;
  showRegenerate: boolean;
  onCopy: () => void;
  onApply: () => void;
};

export function PreviewActionBar({
  documentId,
  canApply,
  edited,
  isApplying,
  showRegenerate,
  onCopy,
  onApply,
}: PreviewActionBarProps) {
  return (
    <footer className="flex shrink-0 flex-col gap-3 border-t border-border-light p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-text-primary">
          Review complete?
        </p>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          {edited
            ? "You modified the AI result before applying."
            : "Preview only - your document has not changed yet."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          <Undo2 className="size-4" />
          Discard / Return to Editor
        </Link>

        {showRegenerate ? (
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <RotateCcw className="size-4" />
            Regenerate
          </Link>
        ) : null}

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          <Clipboard className="size-4" />
          Copy result
        </button>

        <LoadingButton
          className="px-5"
          isLoading={isApplying}
          loadingText="Applying..."
          disabled={!canApply}
          onClick={onApply}
        >
          <Sparkles className="size-4" />
          Apply to Document
        </LoadingButton>
      </div>
    </footer>
  );
}
