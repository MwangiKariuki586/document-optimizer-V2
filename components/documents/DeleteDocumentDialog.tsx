"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CometSpinner } from "@/components/loading-ui/CometSpinner";

type DeleteDocumentDialogProps = {
  documentId: string;
  documentTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function DeleteDocumentDialog({
  documentId,
  documentTitle,
  open,
  onClose,
  onSuccess,
}: DeleteDocumentDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to delete document.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="absolute inset-0 bg-overlay-muted"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error-muted text-error-foreground">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-lg font-semibold leading-7 text-text-primary"
            >
              Delete Document
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Permanently delete{" "}
              <span className="font-medium text-text-primary">
                &ldquo;{documentTitle}&rdquo;
              </span>
              ? This removes the document, all versions, suggestions, and
              exports. This action cannot be undone.
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
            disabled={deleting}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-error-muted px-4 py-2 text-sm font-medium text-error-foreground transition hover:bg-error-light disabled:cursor-not-allowed disabled:opacity-70"
            aria-busy={deleting}
          >
            {deleting ? (
              <>
                <CometSpinner className="size-4" />
                Deleting…
              </>
            ) : (
              "Delete Permanently"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
