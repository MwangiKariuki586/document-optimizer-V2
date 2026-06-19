"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, FilePlus, FileUp, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentsSummaryCards } from "@/components/documents/DocumentsSummaryCards";
import { DocumentsTabs } from "@/components/documents/DocumentsTabs";
import { DocumentsToolbar } from "@/components/documents/DocumentsToolbar";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { DocumentsPagination } from "@/components/documents/DocumentsPagination";
import { RenameDocumentDialog } from "@/components/documents/RenameDocumentDialog";
import { ArchiveDocumentDialog } from "@/components/documents/ArchiveDocumentDialog";
import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
import type {
  DocumentsLibraryItem,
  DocumentsLibraryResult,
} from "@/lib/documents/documents-library.service";

type DialogState =
  | { kind: "none" }
  | { kind: "rename"; doc: DocumentsLibraryItem }
  | { kind: "archive"; doc: DocumentsLibraryItem }
  | { kind: "delete"; doc: DocumentsLibraryItem };

type DocumentsLibraryWorkspaceProps = {
  data: DocumentsLibraryResult;
};

// ─── New Document Dropdown ────────────────────────────────────────────────────

function NewDocumentDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const options = [
    {
      label: "Upload File",
      icon: FileUp,
      href: "/documents/new",
    },
    {
      label: "Paste Text",
      icon: ClipboardList,
      href: "/documents/new",
    },
    {
      label: "Create Blank",
      icon: FilePlus,
      href: "/documents/new",
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
      >
        New Document
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-1.5 min-w-[168px] rounded-xl border border-border bg-surface py-1 shadow-popover"
          >
            {options.map(({ label, icon: Icon, href }) => (
              <button
                key={label}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(href);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                <Icon className="size-4 shrink-0 text-text-muted" />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────

export function DocumentsLibraryWorkspace({
  data,
}: DocumentsLibraryWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  // Read current param values from URL
  const currentTab = searchParams.get("tab") ?? "all";
  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentType = searchParams.get("type") ?? "all";
  const currentFidelity = searchParams.get("fidelity") ?? "all";
  const currentSort = searchParams.get("sort") ?? "lastUpdated";

  const hasActiveFilters =
    currentSearch !== "" ||
    currentStatus !== "all" ||
    currentType !== "all" ||
    currentFidelity !== "all";

  // ─── URL update helper ──────────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (resetPage) {
        params.delete("page");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  // ─── Filter handlers ────────────────────────────────────────────────────────

  function handleTabChange(tab: string) {
    updateParams({ tab });
  }

  function handleSearchChange(value: string) {
    updateParams({ search: value });
  }

  function handleStatusChange(value: string) {
    updateParams({ status: value });
  }

  function handleTypeChange(value: string) {
    updateParams({ type: value });
  }

  function handleFidelityChange(value: string) {
    updateParams({ fidelity: value });
  }

  function handleSortChange(value: string) {
    updateParams({ sort: value === "lastUpdated" ? null : value }, false);
  }

  function handlePageChange(page: number) {
    updateParams({ page: String(page) }, false);
  }

  function handleClearFilters() {
    updateParams({
      search: null,
      status: null,
      type: null,
      fidelity: null,
    });
  }

  // ─── Dialog handlers ────────────────────────────────────────────────────────

  function handleDialogSuccess() {
    startTransition(() => {
      router.refresh();
    });
  }

  function openRename(doc: DocumentsLibraryItem) {
    setDialog({ kind: "rename", doc });
  }

  function openArchive(doc: DocumentsLibraryItem) {
    setDialog({ kind: "archive", doc });
  }

  function openDelete(doc: DocumentsLibraryItem) {
    setDialog({ kind: "delete", doc });
  }

  function closeDialog() {
    setDialog({ kind: "none" });
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Page header */}
      <PageHeader
        eyebrow="Documents"
        title="Documents Library"
        description="Manage uploaded, pasted, and created documents in one place."
        actions={<NewDocumentDropdown />}
      />

      {/* Summary cards */}
      <DocumentsSummaryCards summary={data.summary} />

      {/* Tabs + toolbar + table */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <DocumentsTabs
          activeTab={currentTab}
          counts={data.tabCounts}
          onTabChange={handleTabChange}
        />

        <DocumentsToolbar
          search={currentSearch}
          status={currentStatus}
          type={currentType}
          fidelity={currentFidelity}
          sort={currentSort}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onTypeChange={handleTypeChange}
          onFidelityChange={handleFidelityChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <DocumentsTable
          documents={data.documents}
          total={data.total}
          hasFilters={hasActiveFilters || currentTab !== "all"}
          onClearFilters={handleClearFilters}
          onRenameDoc={openRename}
          onArchiveDoc={openArchive}
          onDeleteDoc={openDelete}
        />

        {data.total > 0 ? (
          <DocumentsPagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>

      {/* Dialogs */}
      {dialog.kind === "rename" ? (
        <RenameDocumentDialog
          documentId={dialog.doc.id}
          currentTitle={dialog.doc.title}
          open
          onClose={closeDialog}
          onSuccess={handleDialogSuccess}
        />
      ) : null}

      {dialog.kind === "archive" ? (
        <ArchiveDocumentDialog
          documentId={dialog.doc.id}
          documentTitle={dialog.doc.title}
          action={dialog.doc.status === "archived" ? "restore" : "archive"}
          open
          onClose={closeDialog}
          onSuccess={handleDialogSuccess}
        />
      ) : null}

      {dialog.kind === "delete" ? (
        <DeleteDocumentDialog
          documentId={dialog.doc.id}
          documentTitle={dialog.doc.title}
          open
          onClose={closeDialog}
          onSuccess={handleDialogSuccess}
        />
      ) : null}
    </>
  );
}
