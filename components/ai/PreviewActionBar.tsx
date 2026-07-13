import Link from "next/link";
import { FileDown } from "lucide-react";

type PreviewActionBarProps = {
  documentId: string;
  requestId?: string;
};

export function PreviewActionBar({
  documentId,
  requestId,
}: PreviewActionBarProps) {
  const exportHref = requestId
    ? `/documents/${documentId}/export?requestId=${encodeURIComponent(requestId)}`
    : `/documents/${documentId}/export`;

  return (
    <footer className="shrink-0 rounded-xl border border-border-light bg-background/95 p-2 shadow-card-soft backdrop-blur">
      <Link
        href={exportHref}
        className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark sm:mx-auto sm:flex sm:w-fit"
      >
        <FileDown className="size-4" />
        Export
      </Link>
    </footer>
  );
}
