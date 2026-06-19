"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ClipboardList, FileUp } from "lucide-react";
import { DocumentStatusBadge } from "@/components/documents/DocumentStatusBadge";
import { FidelityBadge } from "@/components/documents/FidelityBadge";
import type { DocumentsLibraryItem } from "@/lib/documents/documents-library.service";
import type { DocumentStatus } from "@/components/documents/DocumentStatusBadge";
import type { FidelityStatus } from "@/components/documents/FidelityBadge";
import { DocumentActionsMenu } from "@/components/documents/DocumentActionsMenu";
import { newDocumentHref } from "@/lib/documents/new-document.routes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status: string): DocumentStatus {
  const map: Record<string, DocumentStatus> = {
    ready: "Ready",
    draft: "Draft",
    processing: "Processing",
    failed: "Failed",
    archived: "Archived",
  };
  return map[status.toLowerCase()] ?? "Draft";
}

function normalizeFidelity(fidelity: string): FidelityStatus {
  const valid: FidelityStatus[] = [
    "Structure Preserved",
    "Original Preserved",
    "Limited Formatting",
    "Plain Text Only",
    "Formatting Review Needed",
  ];
  return valid.includes(fidelity as FidelityStatus)
    ? (fidelity as FidelityStatus)
    : "Plain Text Only";
}

function fileTypeLabel(fileType: string, sourceType: string): string {
  const map: Record<string, string> = {
    pdf: "PDF",
    docx: "DOCX",
    markdown: "MD",
    txt: "TXT",
  };
  if (fileType in map) return map[fileType];
  if (sourceType === "blank") return "Blank";
  if (sourceType === "paste") return "Text";
  return "—";
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-border-light">
      {[200, 60, 80, 60, 120, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-3 animate-pulse rounded-full bg-surface-tertiary"
            style={{ width: w }}
          />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="h-7 w-14 animate-pulse rounded-md bg-surface-tertiary" />
      </td>
    </tr>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function NoDocumentsState() {
  return (
    <tr>
      <td colSpan={8}>
        <div className="flex flex-col items-center gap-5 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface-secondary text-text-muted shadow-card-soft">
            <FileText className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              No documents yet
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Upload a document or paste text to start optimizing.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={newDocumentHref("upload")}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            >
              <FileUp className="size-4" />
              Upload Document
            </Link>
            <Link
              href={newDocumentHref("paste")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
            >
              <ClipboardList className="size-4" />
              Paste Text
            </Link>
          </div>
        </div>
      </td>
    </tr>
  );
}

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <tr>
      <td colSpan={8}>
        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface-secondary text-text-muted shadow-card-soft">
            <FileText className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              No documents match these filters
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Try adjusting your search or filters.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            Clear filters
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Mobile document card ─────────────────────────────────────────────────────

type MobileDocumentCardProps = {
  doc: DocumentsLibraryItem;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

function MobileDocumentCard({
  doc,
  onRename,
  onArchive,
  onDelete,
}: MobileDocumentCardProps) {
  const router = useRouter();
  const label = fileTypeLabel(doc.fileType, doc.sourceType);
  const status = normalizeStatus(doc.status);
  const isArchived = doc.status === "archived";

  return (
    <div
      role={isArchived ? undefined : "link"}
      tabIndex={isArchived ? undefined : 0}
      onClick={() => {
        if (!isArchived) {
          router.push(`/documents/${doc.id}`);
        }
      }}
      onKeyDown={(event) => {
        if (
          !isArchived &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          router.push(`/documents/${doc.id}`);
        }
      }}
      className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card-soft ${
        isArchived ? "" : "cursor-pointer transition hover:bg-surface-secondary"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {doc.title}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {label} · {formatRelativeDate(doc.updatedAt)}
          </p>
        </div>
        <div onClick={(event) => event.stopPropagation()}>
          <DocumentActionsMenu
            doc={doc}
            onRename={onRename}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DocumentStatusBadge status={status} />
        <FidelityBadge status={normalizeFidelity(doc.fidelityStatus)} />
        {doc.pendingSuggestionsCount > 0 ? (
          <span className="inline-flex whitespace-nowrap rounded-full bg-ai-muted px-2 py-0.5 text-xs font-medium text-ai-dark">
            {doc.pendingSuggestionsCount} suggestion
            {doc.pendingSuggestionsCount !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-text-muted">
        {doc.wordCount.toLocaleString("en-US")} words
      </p>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

type DocumentsTableProps = {
  documents: DocumentsLibraryItem[];
  loading?: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onRenameDoc: (doc: DocumentsLibraryItem) => void;
  onArchiveDoc: (doc: DocumentsLibraryItem) => void;
  onDeleteDoc: (doc: DocumentsLibraryItem) => void;
};

export function DocumentsTable({
  documents,
  loading,
  hasFilters,
  onClearFilters,
  onRenameDoc,
  onArchiveDoc,
  onDeleteDoc,
}: DocumentsTableProps) {
  const router = useRouter();
  const isEmpty = !loading && documents.length === 0;
  const isFilteredEmpty = isEmpty && hasFilters;
  const isFullyEmpty = isEmpty && !hasFilters;

  return (
    <>
      {/* Desktop / Tablet: Table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface shadow-card-soft sm:block">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="border-b border-border-light bg-surface-secondary">
              <th
                scope="col"
                className="w-[260px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Document
              </th>
              <th
                scope="col"
                className="w-[64px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Type
              </th>
              <th
                scope="col"
                className="w-[96px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Status
              </th>
              <th
                scope="col"
                className="w-[88px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Suggestions
              </th>
              <th
                scope="col"
                className="w-[180px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Fidelity
              </th>
              <th
                scope="col"
                className="w-[108px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Last Updated
              </th>
              <th
                scope="col"
                className="w-[72px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-normal text-text-muted"
              >
                Words
              </th>
              <th scope="col" className="w-[96px] px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : isFilteredEmpty ? (
              <FilteredEmptyState onClear={onClearFilters} />
            ) : isFullyEmpty ? (
              <NoDocumentsState />
            ) : (
              documents.map((doc) => {
                const status = normalizeStatus(doc.status);
                const label = fileTypeLabel(doc.fileType, doc.sourceType);
                const isArchived = doc.status === "archived";

                return (
                  <tr
                    key={doc.id}
                    onClick={() => {
                      if (!isArchived) {
                        router.push(`/documents/${doc.id}`);
                      }
                    }}
                    className={`transition hover:bg-surface-secondary ${
                      isArchived ? "" : "cursor-pointer"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {doc.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-text-muted capitalize">
                          {doc.sourceType}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DocumentStatusBadge status={status} />
                    </td>
                    <td className="px-4 py-3">
                      {doc.pendingSuggestionsCount > 0 ? (
                        <span className="inline-flex whitespace-nowrap rounded-full bg-ai-muted px-2 py-0.5 text-xs font-medium text-ai-dark">
                          {doc.pendingSuggestionsCount}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <FidelityBadge
                        status={normalizeFidelity(doc.fidelityStatus)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        {formatRelativeDate(doc.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        {doc.wordCount.toLocaleString("en-US")}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex items-center justify-end">
                        <DocumentActionsMenu
                          doc={doc}
                          onRename={() => onRenameDoc(doc)}
                          onArchive={() => onArchiveDoc(doc)}
                          onDelete={() => onDeleteDoc(doc)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card list */}
      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[120px] animate-pulse rounded-xl border border-border bg-surface shadow-card-soft"
            />
          ))
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-card-soft">
            <p className="text-sm font-semibold text-text-primary">
              No documents match these filters
            </p>
            <p className="text-sm text-text-secondary">
              Try adjusting your search or filters.
            </p>
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
            >
              Clear filters
            </button>
          </div>
        ) : isFullyEmpty ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-card-soft">
            <p className="text-sm font-semibold text-text-primary">
              No documents yet
            </p>
            <p className="text-sm text-text-secondary">
              Upload a document or paste text.
            </p>
            <Link
              href={newDocumentHref("upload")}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            >
              Upload Document
            </Link>
          </div>
        ) : (
          documents.map((doc) => (
            <MobileDocumentCard
              key={doc.id}
              doc={doc}
              onRename={() => onRenameDoc(doc)}
              onArchive={() => onArchiveDoc(doc)}
              onDelete={() => onDeleteDoc(doc)}
            />
          ))
        )}
      </div>
    </>
  );
}
