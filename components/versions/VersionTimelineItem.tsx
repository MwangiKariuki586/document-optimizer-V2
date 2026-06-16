import { MoreVertical, Sparkles, UserRound } from "lucide-react";

import {
  formatVersionDate,
  getVersionAuthor,
  isManualSource,
  sourceLabel,
} from "@/lib/versions/version-history.utils";
import type { VersionListItem } from "@/lib/versions/versions.service";

type VersionTimelineItemProps = {
  version: VersionListItem;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
};

export function VersionTimelineItem({
  version,
  isSelected,
  isCurrent,
  onSelect,
}: VersionTimelineItemProps) {
  const label = sourceLabel[version.source];
  const author = getVersionAuthor(version.source);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full grid-cols-[minmax(0,1fr)_20px] gap-2 border-b border-border-light px-3 py-2.5 text-left transition hover:bg-surface-secondary ${
        isSelected
          ? "border-l-2 border-l-accent bg-accent-muted"
          : "border-l-2 border-l-transparent bg-surface"
      }`}
    >
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`shrink-0 text-xs font-bold ${
              isSelected ? "text-accent" : "text-text-primary"
            }`}
          >
            v{version.versionNumber}
          </span>
          <span
            className="truncate text-sm font-medium text-text-primary"
            title={label}
          >
            {label}
          </span>
          {isCurrent ? (
            <span className="shrink-0 rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent">
              Current
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-text-muted">
          {formatVersionDate(version.createdAt)}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-secondary">
          {isManualSource(version.source) ? (
            <UserRound className="size-3 shrink-0" />
          ) : (
            <Sparkles className="size-3 shrink-0" />
          )}
          <span className="truncate">{author}</span>
        </span>
      </span>
      <MoreVertical className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden />
    </button>
  );
}
