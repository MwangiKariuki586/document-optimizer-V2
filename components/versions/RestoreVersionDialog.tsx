import { X } from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";
import { formatVersionDate, sourceLabel } from "@/lib/versions/version-history.utils";
import type { VersionListItem } from "@/lib/versions/versions.service";

type RestoreVersionDialogProps = {
  version: VersionListItem;
  isRestoring: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function RestoreVersionDialog({
  version,
  isRestoring,
  onCancel,
  onConfirm,
}: RestoreVersionDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-version-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-muted px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-popover">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="restore-version-title"
              className="text-lg font-semibold text-text-primary"
            >
              Restore this version?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Your current document will be saved as a new version before this
              restore is applied. You can return to it later if needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-1 text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Close restore confirmation"
            disabled={isRestoring}
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5 rounded-lg border border-border-light bg-surface-secondary p-3 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">
            v{version.versionNumber} {sourceLabel[version.source]}
          </span>{" "}
          from {formatVersionDate(version.createdAt)}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRestoring}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <LoadingButton
            type="button"
            isLoading={isRestoring}
            loadingText="Restoring"
            onClick={onConfirm}
          >
            Restore Version
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
