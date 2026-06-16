import { ChevronDown } from "lucide-react";

import {
  formatVersionDate,
  sourceLabel,
  type PreviewRecord,
} from "@/lib/versions/version-history.utils";
import type { VersionListItem } from "@/lib/versions/versions.service";

type VersionSelectorProps = {
  label: string;
  value: PreviewRecord;
  versions: VersionListItem[];
  currentVersion: PreviewRecord;
  disabled?: boolean;
  onChange?: (versionNumber: number) => void;
};

export function VersionSelector({
  label,
  value,
  versions,
  currentVersion,
  disabled = false,
  onChange,
}: VersionSelectorProps) {
  const displayLabel =
    value.source === "current" ? "Current" : sourceLabel[value.source];
  const options = [
    ...versions.map((version) => ({
      versionNumber: version.versionNumber,
      label: `v${version.versionNumber} ${sourceLabel[version.source]}`,
    })),
  ];

  if (label === "Current") {
    return (
      <div className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 shadow-card-soft">
        <p className="text-[11px] font-semibold uppercase tracking-normal text-text-muted">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-text-primary">
          v{currentVersion.versionNumber} Current
        </p>
        <p className="truncate text-[11px] text-text-muted">
          {formatVersionDate(currentVersion.createdAt)}
        </p>
      </div>
    );
  }

  return (
    <label className="relative min-w-0 flex-1">
      <span className="block text-[11px] font-semibold uppercase tracking-normal text-text-muted">
        {label}
      </span>
      <span className="relative mt-1 block">
        <select
          value={value.versionNumber}
          disabled={disabled || !onChange}
          onChange={(event) => onChange?.(Number(event.target.value))}
          className="h-8 w-full appearance-none truncate rounded-lg border border-border bg-surface py-1 pl-3 pr-8 text-sm font-semibold text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-default disabled:opacity-80"
          aria-label={`${label} version`}
        >
          {options.map((option) => (
            <option key={option.versionNumber} value={option.versionNumber}>
              {option.label}
            </option>
          ))}
        </select>
        {onChange ? (
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        ) : null}
      </span>
      <span className="block truncate text-[11px] text-text-muted">
        {displayLabel} · {formatVersionDate(value.createdAt)}
      </span>
    </label>
  );
}
