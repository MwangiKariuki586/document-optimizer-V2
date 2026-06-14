"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

import {
  EditorMenuBackdrop,
  EditorMenuFooter,
  EditorMenuPanel,
  EditorMenuSectionHeader,
} from "@/components/editor/EditorMenu";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import type { VersionListItem, VersionSource } from "@/lib/versions/versions.service";

type VersionMenuProps = {
  currentVersionNumber: number;
  documentId: string;
  refreshKey: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SOURCE_LABELS: Record<VersionSource, string> = {
  upload: "Uploaded",
  paste: "Pasted",
  blank: "Created",
  manual_save: "Manual save",
  ai_apply: "AI apply",
  suggestion_apply: "Suggestion",
  restore: "Restored",
};

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function VersionMenu({
  currentVersionNumber,
  documentId,
  refreshKey,
  open,
  onOpenChange,
}: VersionMenuProps) {
  const [versions, setVersions] = useState<VersionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadVersions = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        const data: {
          success: boolean;
          error?: string;
          data?: VersionListItem[];
        } = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok || !data.success) {
          setLoadError(data.error ?? "Could not load versions.");
          return;
        }

        setVersions(data.data ?? []);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load versions.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadVersions();

    return () => {
      cancelled = true;
    };
  }, [open, documentId, refreshKey]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="inline-flex items-center gap-1.5 rounded-md bg-accent-light px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-lighter"
      >
        <Clock className="size-3.5" />
        Version {currentVersionNumber}
        <span className="rounded-full bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-accent ring-1 ring-accent/20">
          Current
        </span>
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <>
          <EditorMenuBackdrop onClose={() => onOpenChange(false)} />
          <EditorMenuPanel className="w-72">
            <EditorMenuSectionHeader>Version history</EditorMenuSectionHeader>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <CometSpinner className="size-5" />
              </div>
            ) : loadError ? (
              <p className="px-2.5 py-2 text-sm text-danger-foreground">
                {loadError}
              </p>
            ) : versions.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-text-muted">
                No versions saved yet.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {versions.map((version) => {
                  const isCurrent =
                    version.versionNumber === currentVersionNumber;

                  return (
                    <div
                      key={version.versionNumber}
                      role="menuitem"
                      aria-disabled
                      className={`rounded-md px-2.5 py-2 ${
                        isCurrent
                          ? "border-l-2 border-accent bg-accent-light/40 ring-1 ring-accent/20"
                          : "text-text-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="text-sm font-medium">
                            Version {version.versionNumber}
                          </span>
                          {isCurrent ? (
                            <span className="rounded-full bg-accent-light px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                              Current
                            </span>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-xs text-text-muted">
                          {formatRelativeDate(version.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                          {SOURCE_LABELS[version.source]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <EditorMenuFooter>
              Restore and preview coming in a later update.
            </EditorMenuFooter>
          </EditorMenuPanel>
        </>
      ) : null}
    </div>
  );
}
