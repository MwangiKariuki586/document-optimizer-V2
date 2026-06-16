import Link from "next/link";
import { ArrowLeftRight, RotateCcw, Undo2 } from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";

type VersionActionBarProps = {
  documentId: string;
  canRestore: boolean;
  isRestoring: boolean;
  onCompareAnother: () => void;
  onRestore: () => void;
};

export function VersionActionBar({
  documentId,
  canRestore,
  isRestoring,
  onCompareAnother,
  onRestore,
}: VersionActionBarProps) {
  if (!canRestore) {
    return null;
  }

  return (
    <footer className="flex shrink-0 flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 shadow-card-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          <Undo2 className="size-4" />
          Back to Editor
        </Link>
        <button
          type="button"
          onClick={onCompareAnother}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-accent transition hover:bg-surface-secondary"
        >
          <ArrowLeftRight className="size-4" />
          Compare another version
        </button>
      </div>
      <LoadingButton
        className="min-h-9 px-5"
        isLoading={isRestoring}
        loadingText="Restoring"
        onClick={onRestore}
      >
        <RotateCcw className="size-4" />
        Restore selected version
      </LoadingButton>
    </footer>
  );
}
