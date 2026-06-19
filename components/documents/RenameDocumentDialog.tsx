"use client";

import { useEffect, useRef, useState } from "react";
import { CometSpinner } from "@/components/loading-ui/CometSpinner";
import {
  documentTitleSchema,
  TITLE_ALLOWED_MESSAGE,
} from "@/lib/documents/document.validators";

type RenameDocumentDialogProps = {
  documentId: string;
  currentTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function RenameDocumentDialog({
  documentId,
  currentTitle,
  open,
  onClose,
  onSuccess,
}: RenameDocumentDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setError(null);
      setSaving(false);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [open, currentTitle]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = documentTitleSchema.safeParse(title);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? TITLE_ALLOWED_MESSAGE);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/documents/${documentId}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to rename document.");
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
      aria-labelledby="rename-dialog-title"
    >
      <div
        className="absolute inset-0 bg-overlay-muted"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-popover">
        <h2
          id="rename-dialog-title"
          className="text-lg font-semibold leading-7 text-text-primary"
        >
          Rename Document
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter a new title for this document.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="rename-title"
              className="block text-sm font-medium text-text-primary"
            >
              Document Title
            </label>
            <input
              ref={inputRef}
              id="rename-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              maxLength={120}
              className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-accent ${
                error
                  ? "border-error-foreground bg-error-muted focus:border-error-foreground"
                  : "border-border bg-surface focus:border-accent"
              }`}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "rename-error" : undefined}
              disabled={saving}
            />
            {error ? (
              <p id="rename-error" className="mt-1.5 text-xs text-error-foreground">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <CometSpinner className="size-4" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
