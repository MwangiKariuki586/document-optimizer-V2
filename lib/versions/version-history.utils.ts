import type { VersionListItem, VersionSource } from "@/lib/versions/versions.service";

export type VersionTab = "all" | "ai" | "manual" | "exports";

export type PreviewRecord = {
  versionNumber: number;
  title: string;
  source: VersionSource | "current";
  createdAt: string;
  notes: string | null;
  contentMarkdown: string;
};

export type VersionChangeSummary = {
  additions: number;
  deletions: number;
  modifications: number;
};

export const versionTabs: { key: VersionTab; label: string }[] = [
  { key: "all", label: "All Versions" },
  { key: "ai", label: "AI Versions" },
  { key: "manual", label: "Manual Versions" },
  { key: "exports", label: "Exports" },
];

export const sourceLabel: Record<VersionSource | "current", string> = {
  upload: "Original Upload",
  paste: "Pasted Text",
  blank: "Blank Document",
  manual_save: "Manual Edit",
  ai_apply: "AI Optimized",
  suggestion_apply: "AI Suggestion",
  restore: "Restored",
  current: "Current Working Copy",
};

export function filterVersions(tab: VersionTab, versions: VersionListItem[]) {
  if (tab === "ai") {
    return versions.filter(
      (version) =>
        version.source === "ai_apply" || version.source === "suggestion_apply",
    );
  }

  if (tab === "manual") {
    return versions.filter(
      (version) =>
        version.source === "manual_save" ||
        version.source === "upload" ||
        version.source === "paste" ||
        version.source === "blank" ||
        version.source === "restore",
    );
  }

  if (tab === "exports") {
    return [];
  }

  return versions;
}

export function formatVersionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function splitWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function getVersionChangeSummary(
  selectedMarkdown: string,
  currentMarkdown: string,
): VersionChangeSummary {
  const selectedWords = splitWords(selectedMarkdown);
  const currentWords = splitWords(currentMarkdown);
  const selectedSet = new Set(selectedWords.map((word) => word.toLowerCase()));
  const currentSet = new Set(currentWords.map((word) => word.toLowerCase()));
  const additions = currentWords.filter(
    (word) => !selectedSet.has(word.toLowerCase()),
  ).length;
  const deletions = selectedWords.filter(
    (word) => !currentSet.has(word.toLowerCase()),
  ).length;

  return {
    additions,
    deletions,
    modifications: Math.min(additions, deletions),
  };
}

export function getVersionAuthor(source: VersionSource | "current") {
  if (
    source === "manual_save" ||
    source === "upload" ||
    source === "paste" ||
    source === "blank" ||
    source === "current"
  ) {
    return "You";
  }

  return "Document Optimizer";
}

export function isManualSource(source: VersionSource | "current") {
  return (
    source === "manual_save" ||
    source === "upload" ||
    source === "paste" ||
    source === "blank" ||
    source === "current"
  );
}

export function toPreviewRecord(
  version: VersionListItem | PreviewRecord,
): PreviewRecord {
  if (version.source === "current") {
    return version;
  }

  return {
    versionNumber: version.versionNumber,
    title: version.title,
    source: version.source,
    createdAt: version.createdAt,
    notes: version.notes,
    contentMarkdown: version.contentMarkdown,
  };
}
