import Link from "next/link";
import { FileDown, Undo2 } from "lucide-react";

type PreviewActionBarProps = {
  documentId: string;
};

export function PreviewActionBar({ documentId }: PreviewActionBarProps) {
  return (
    <footer className="flex shrink-0 flex-col gap-2 rounded-xl px-4 py-2 lg:flex-row lg:items-center lg:justify-center">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-1.5 text-sm font-medium text-accent transition hover:bg-surface-secondary"
        >
          <Undo2 className="size-4" />
          Return to Editor
        </Link>

        <Link
          href={`/documents/${documentId}/export`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-accent px-5 py-1.5 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
        >
          <FileDown className="size-4" />
          Export
        </Link>
      </div>
    </footer>
  );
}
