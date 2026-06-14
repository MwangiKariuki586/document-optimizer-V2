// Server component — mock data only in this phase
import Link from "next/link";
import { FileText, MoreVertical } from "lucide-react";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import type { DocumentStatus } from "@/components/documents/DocumentStatusBadge";

type RecentUpload = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: DocumentStatus;
};

// Mock data — replaced with real Supabase queries in Phase 3 / Feature 12
const MOCK_UPLOADS: RecentUpload[] = [
  {
    id: "1",
    name: "Q2 Marketing Strategy.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2 hours ago",
    status: "Ready",
  },
  {
    id: "2",
    name: "Product Roadmap.docx",
    type: "DOCX",
    size: "1.8 MB",
    uploadedAt: "1 day ago",
    status: "Ready",
  },
  {
    id: "3",
    name: "Meeting Notes.txt",
    type: "TXT",
    size: "256 KB",
    uploadedAt: "2 days ago",
    status: "Draft",
  },
  {
    id: "4",
    name: "Content Brief.md",
    type: "MD",
    size: "98 KB",
    uploadedAt: "3 days ago",
    status: "Processing",
  },
];

/** Small colored type chip matching the document type. */
function TypeChip({ type }: { type: string }) {
  const map: Record<string, string> = {
    PDF: "bg-error-muted text-error-foreground",
    DOCX: "bg-info-muted text-info-foreground",
    TXT: "bg-surface-tertiary text-text-secondary",
    MD: "bg-accent-light text-accent",
  };
  const cls = map[type] ?? "bg-surface-tertiary text-text-secondary";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {type}
    </span>
  );
}

export function RecentUploads() {
  return (
    <section
      className="rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
      aria-label="Recent uploads"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">Recent Uploads</h2>
        <Link
          href="/documents"
          className="text-sm font-medium text-accent hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Desktop table */}
      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm" aria-label="Recent uploads table">
          <thead>
            <tr className="border-b border-border">
              {["Name", "Type", "Size", "Uploaded", "Status", ""].map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className="pb-3 pr-4 text-xs font-medium uppercase tracking-wide text-text-muted last:pr-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {MOCK_UPLOADS.map((doc) => (
              <tr
                key={doc.id}
                className="transition-colors hover:bg-surface-secondary"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded bg-surface-tertiary">
                      <FileText className="size-4 text-text-secondary" />
                    </div>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-text-primary hover:text-accent"
                    >
                      {doc.name}
                    </Link>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <TypeChip type={doc.type} />
                </td>
                <td className="py-3 pr-4 text-text-secondary">{doc.size}</td>
                <td className="py-3 pr-4 text-text-muted">{doc.uploadedAt}</td>
                <td className="py-3 pr-4">
                  <DocumentStatusBadge status={doc.status} />
                </td>
                <td className="py-3 pr-4 text-right">
                  <button type="button" className="text-text-muted hover:text-text-primary">
                    <span className="sr-only">Actions for {doc.name}</span>
                    <MoreVertical className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="mt-4 space-y-3 md:hidden" role="list">
        {MOCK_UPLOADS.map((doc) => (
          <li
            key={doc.id}
            className="rounded-xl border border-border-light p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/documents/${doc.id}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary hover:text-accent"
              >
                {doc.name}
              </Link>
              <DocumentStatusBadge status={doc.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <TypeChip type={doc.type} />
              <span>{doc.size}</span>
              <span>·</span>
              <span>{doc.uploadedAt}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
