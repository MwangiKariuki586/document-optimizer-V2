"use client";

import {
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { VersionChangeSummaryCard } from "@/components/versions/VersionChangeSummaryCard";
import {
  formatVersionDate,
  getVersionAuthor,
  isManualSource,
  sourceLabel,
  type PreviewRecord,
  type VersionChangeSummary,
} from "@/lib/versions/version-history.utils";

type VersionDetailsPanelProps = {
  selectedPreview: PreviewRecord;
  isCurrentSelected: boolean;
  changeSummary: VersionChangeSummary;
  onRestore: () => void;
  canRestore: boolean;
  onClose?: () => void;
  variant?: "panel" | "drawer";
};

export function VersionDetailsPanel({
  selectedPreview,
  isCurrentSelected,
  changeSummary,
  onRestore,
  canRestore,
  onClose,
  variant = "panel",
}: VersionDetailsPanelProps) {
  const isUpload = selectedPreview.source === "upload";
  const isAiSource =
    selectedPreview.source === "ai_apply" ||
    selectedPreview.source === "suggestion_apply";

  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-semibold text-accent">
          v{selectedPreview.versionNumber}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">
              {sourceLabel[selectedPreview.source]}
            </h3>
            {isCurrentSelected ? (
              <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                Current Version
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {formatVersionDate(selectedPreview.createdAt)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
            {isManualSource(selectedPreview.source) ? (
              <UserRound className="size-3.5 shrink-0" />
            ) : (
              <Sparkles className="size-3.5 shrink-0" />
            )}
            by {getVersionAuthor(selectedPreview.source)}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
          Notes
        </h3>
        <p className="mt-2 rounded-lg border border-border-light bg-surface-secondary p-3 text-sm text-text-secondary">
          {selectedPreview.notes ?? "No notes saved for this version."}
        </p>
      </div>

      <div className="mt-3">
        <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
          Change Summary
        </h3>
        <div className="mt-2">
          <VersionChangeSummaryCard
            summary={changeSummary}
            isOriginalUpload={isUpload}
            aiSummary={
              isAiSource
                ? "Improved clarity, tone, and structure compared with the previous saved state."
                : null
            }
          />
        </div>
      </div>

      <details className="mt-3 rounded-lg border border-border-light bg-surface-secondary p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-normal text-text-muted">
          Version Safety
        </summary>
        <ul className="mt-3 space-y-2">
          {[
            "Restore is scoped to this signed-in document.",
            "Current content is saved before restore.",
            "Structured editor content is restored when available.",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-3 lg:hidden">
        <button
          type="button"
          onClick={onRestore}
          disabled={!canRestore}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:hover:bg-transparent"
        >
          <RotateCcw className="size-4" />
          Restore this version
        </button>
      </div>
    </>
  );

  if (variant === "drawer") {
    return (
      <div className="fixed inset-0 z-40 flex justify-end bg-overlay-muted">
        <button
          type="button"
          className="absolute inset-0"
          aria-label="Close version details"
          onClick={onClose}
        />
        <aside className="relative flex h-full w-full max-w-sm flex-col overflow-hidden border-l border-border bg-surface shadow-popover">
          <div className="flex shrink-0 items-center justify-between border-b border-border-light px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
                aria-label="Close details"
              >
                <ChevronLeft className="size-4" />
              </button>
              <h2 className="text-sm font-semibold text-text-primary">
                Version Details
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
              aria-label="Close details panel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {content}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft xl:w-[288px]">
      <div className="flex shrink-0 items-center justify-between border-b border-border-light px-3 py-2">
        <h2 className="text-sm font-semibold text-text-primary">
          Version Details
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition hover:bg-surface-secondary hover:text-text-primary xl:hidden"
            aria-label="Collapse version details"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">{content}</div>
      <div className="hidden shrink-0 p-3 lg:block">
        <button
          type="button"
          onClick={onRestore}
          disabled={!canRestore}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:hover:bg-transparent"
        >
          <RotateCcw className="size-4" />
          Restore this version
        </button>
      </div>
    </aside>
  );
}
