import Link from "next/link";
import { FileText, MoreHorizontal, Plus } from "lucide-react";
import {
  DocumentStatusBadge,
  type DocumentStatus,
} from "@/components/documents/DocumentStatusBadge";
import {
  FidelityBadge,
  type FidelityStatus,
} from "@/components/documents/FidelityBadge";

type RecentDocument = {
  fidelity: FidelityStatus;
  folder: string;
  href: string;
  id: string;
  status: DocumentStatus;
  title: string;
  type: "DOCX" | "PDF" | "MD" | "TXT" | "None";
  updated: string;
  words: string;
};

type RecentDocumentsProps = {
  documents: RecentDocument[];
};

const fileTypeClasses: Record<RecentDocument["type"], string> = {
  DOCX: "bg-info-muted text-info-foreground",
  PDF: "bg-error-muted text-error-foreground",
  MD: "bg-surface-tertiary text-text-secondary",
  TXT: "bg-success-muted text-success-foreground",
  None: "bg-surface-secondary text-text-muted",
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const visibleDocuments = documents.slice(0, 5);

  return (
    <section className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold leading-7 text-text-primary">
            Recent Documents
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Track files, quality state, and formatting confidence.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="shrink-0 text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          View all documents
        </Link>
      </div>

      {visibleDocuments.length === 0 ? (
        <div className="mt-5 flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl bg-surface-secondary px-4 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-surface text-accent shadow-card-soft">
            <FileText className="size-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-text-primary">
            No documents yet.
          </h3>
          <p className="mt-1 max-w-sm text-sm leading-5 text-text-secondary">
            Upload a file, paste text, or create a blank document to begin.
          </p>
          <Link
            href="/documents/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
          >
            <Plus className="size-4" />
            Start a Document
          </Link>
        </div>
      ) : (
        <>
          <div className="scrollbar-hidden mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 md:hidden">
            {visibleDocuments.map((document) => (
              <Link
                key={document.id}
                href={document.href}
                className="block rounded-xl border border-border-light bg-surface p-4 transition hover:bg-surface-secondary"
              >
                <div className="flex gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${fileTypeClasses[document.type]}`}
                  >
                    <FileText className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-text-primary">
                          {document.title}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          / {document.folder} / {document.words} words
                        </p>
                      </div>
                      <span className="rounded-md bg-surface-tertiary px-2 py-1 text-xs font-medium text-text-secondary">
                        {document.type}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <DocumentStatusBadge status={document.status} />
                      <FidelityBadge status={document.fidelity} />
                    </div>
                    <p className="mt-3 text-xs text-text-muted">
                      Updated {document.updated}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="scrollbar-hidden mt-5 hidden min-h-0 flex-1 overflow-auto pb-2 md:block">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr className="border-b border-border-light text-left text-xs font-medium uppercase text-text-muted">
                  <th className="py-3 pr-4">Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Words</th>
                  <th className="px-4 py-3">Fidelity</th>
                  <th className="py-3 pl-4 text-right">More</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {visibleDocuments.map((document) => (
                  <tr
                    key={document.id}
                    className="text-sm text-text-primary transition hover:bg-surface-secondary"
                  >
                    <td className="py-4 pr-4">
                      <Link href={document.href} className="flex min-w-0 gap-3">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${fileTypeClasses[document.type]}`}
                        >
                          <FileText className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {document.title}
                          </span>
                          <span className="mt-1 block text-sm text-text-secondary">
                            / {document.folder}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-surface-tertiary px-2 py-1 text-xs font-medium text-text-secondary">
                        {document.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <DocumentStatusBadge status={document.status} />
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {document.updated}
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {document.words}
                    </td>
                    <td className="px-4 py-4">
                      <FidelityBadge status={document.fidelity} />
                    </td>
                    <td className="py-4 pl-4 text-right text-text-muted">
                      <MoreHorizontal className="ml-auto size-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
