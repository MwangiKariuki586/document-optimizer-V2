"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Download,
  History,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { DocumentsLibraryItem } from "@/lib/documents/documents-library.service";
import { newDocumentHref } from "@/lib/documents/new-document.routes";

type DocumentActionsMenuProps = {
  doc: DocumentsLibraryItem;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function DocumentActionsMenu({
  doc,
  onRename,
  onArchive,
  onDelete,
}: DocumentActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isArchived = doc.status === "archived";
  const isReady = doc.status === "ready";
  const hasSuggestions = doc.pendingSuggestionsCount > 0;
  const isFailed = doc.status === "failed";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      globalThis.document.addEventListener("click", handleClickOutside);
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      globalThis.document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function action(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex size-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1.5 min-w-[180px] rounded-xl border border-border bg-surface py-1 shadow-popover"
        >
          {hasSuggestions && !isArchived ? (
            <button
              role="menuitem"
              type="button"
              onClick={() =>
                action(() => router.push(`/documents/${doc.id}`))
              }
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-ai-dark transition hover:bg-ai-muted"
            >
              <Sparkles className="size-4 shrink-0" />
              Review Suggestions
            </button>
          ) : null}

          {!isArchived ? (
            <button
              role="menuitem"
              type="button"
              onClick={() =>
                action(() => router.push(`/documents/${doc.id}/versions`))
              }
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <History className="size-4 shrink-0" />
              View Versions
            </button>
          ) : null}

          {isReady && !isArchived ? (
            <button
              role="menuitem"
              type="button"
              onClick={() =>
                action(() => router.push(`/documents/${doc.id}/export`))
              }
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <Download className="size-4 shrink-0" />
              Export
            </button>
          ) : null}

          {isFailed ? (
            <button
              role="menuitem"
              type="button"
              onClick={() => action(() => router.push(newDocumentHref("upload")))}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-warning-foreground transition hover:bg-warning-muted"
            >
              <RotateCcw className="size-4 shrink-0" />
              Retry Processing
            </button>
          ) : null}

          <div className="my-1 h-px bg-border-light" role="separator" />

          {!isArchived ? (
            <button
              role="menuitem"
              type="button"
              onClick={() => action(onRename)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              <Pencil className="size-4 shrink-0" />
              Rename
            </button>
          ) : null}

          <button
            role="menuitem"
            type="button"
            onClick={() => action(onArchive)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
          >
            {isArchived ? (
              <>
                <RotateCcw className="size-4 shrink-0" />
                Restore
              </>
            ) : (
              <>
                <Archive className="size-4 shrink-0" />
                Archive
              </>
            )}
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={() => action(onDelete)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-error-foreground transition hover:bg-error-muted"
          >
            <Trash2 className="size-4 shrink-0" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
