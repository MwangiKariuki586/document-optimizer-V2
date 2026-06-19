"use client";

import { useState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { CometSpinner } from "@/components/loading-ui/CometSpinner";

type ArchiveDocumentDialogProps = {
  documentId: string;
  documentTitle: string;
  action: "archive" | "restore";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ArchiveDocumentDialog({
  documentId,
  documentTitle,
  action,
  open,
  onClose,
  onSuccess,
}: ArchiveDocumentDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isRestore = action === "restore";

  async function handleConfirm() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? `Failed to ${action} document.`);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
    >
      <div
        className="absolute inset-0 bg-overlay-muted"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isRestore
                ? "bg-info-muted text-info-foreground"
                : "bg-surface-tertiary text-text-secondary"
            }`}
          >
            {isRestore ? (
              <RotateCcw className="size-5" />
            ) : (
              <Archive className="size-5" />
            )}
          </div>
          <div>
            <h2
              id="archive-dialog-title"
              className="text-lg font-semibold leading-7 text-text-primary"
            >
              {isRestore ? "Restore Document" : "Archive Document"}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {isRestore
                ? `Restore "${documentTitle}" to your active document library?`
                : `Archive "${documentTitle}"? It will be moved out of your active library and can be restored later.`}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-error-muted px-3 py-2 text-xs text-error-foreground">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
              isRestore
                ? "bg-accent text-accent-foreground hover:bg-accent-dark"
                : "bg-surface-tertiary text-text-secondary hover:bg-border"
            }`}
            aria-busy={saving}
          >
            {saving ? (
              <>
                <CometSpinner className="size-4" />
                {isRestore ? "Restoring…" : "Archiving…"}
              </>
            ) : isRestore ? (
              "Restore"
            ) : (
              "Archive"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
