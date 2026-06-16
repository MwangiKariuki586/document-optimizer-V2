"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, RotateCcw } from "lucide-react";

import { VersionChangeSummaryCard } from "@/components/versions/VersionChangeSummaryCard";
import { VersionPreviewPane } from "@/components/versions/VersionPreviewPane";
import { VersionSelector } from "@/components/versions/VersionSelector";
import type {
  VersionChangeSummary,
  PreviewRecord,
} from "@/lib/versions/version-history.utils";
import type { VersionListItem } from "@/lib/versions/versions.service";

type ComparisonPreviewTab = "selected" | "current" | "changes";

type VersionComparisonWorkspaceProps = {
  selectedPreview: PreviewRecord;
  currentPreview: PreviewRecord;
  versions: VersionListItem[];
  currentVersionNumber: number;
  changeSummary: VersionChangeSummary;
  onSelectedVersionChange: (versionNumber: number) => void;
  onRestore?: () => void;
  canRestore: boolean;
  comparisonRef?: React.RefObject<HTMLElement | null>;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function VersionComparisonWorkspace({
  selectedPreview,
  currentPreview,
  versions,
  currentVersionNumber,
  changeSummary,
  onSelectedVersionChange,
  onRestore,
  canRestore,
  comparisonRef,
}: VersionComparisonWorkspaceProps) {
  const isWideComparison = useMediaQuery("(min-width: 900px)");
  const [previewTab, setPreviewTab] =
    useState<ComparisonPreviewTab>("selected");

  const previewTabs: { key: ComparisonPreviewTab; label: string }[] = [
    { key: "selected", label: "Selected Version" },
    { key: "current", label: "Current Version" },
    { key: "changes", label: "Changes" },
  ];

  return (
    <section
      ref={comparisonRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden"
    >
      <div className="shrink-0 rounded-xl border border-border bg-surface px-3 py-2 shadow-card-soft">
        <div className="flex flex-col gap-2 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <h2 className="shrink-0 text-sm font-semibold text-text-primary">
            Compare Versions
          </h2>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <VersionSelector
              label="Selected"
              value={selectedPreview}
              versions={versions}
              currentVersion={currentPreview}
              onChange={onSelectedVersionChange}
            />
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-secondary text-accent">
              <ArrowLeftRight className="size-4" />
            </div>
            <VersionSelector
              label="Current"
              value={currentPreview}
              versions={versions}
              currentVersion={currentPreview}
              disabled
            />
          </div>
        </div>
      </div>

      {isWideComparison ? (
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 xl:min-h-0 xl:overflow-hidden">
          <VersionPreviewPane
            label="Selected Version"
            version={selectedPreview}
            currentVersionNumber={currentVersionNumber}
          />
          <VersionPreviewPane
            label="Current Version"
            version={currentPreview}
            currentVersionNumber={currentVersionNumber}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border-light px-2 py-2">
            {previewTabs.map((tab) => {
              const isActive = previewTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPreviewTab(tab.key)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-2">
            {previewTab === "selected" ? (
              <VersionPreviewPane
                label="Selected Version"
                version={selectedPreview}
                currentVersionNumber={currentVersionNumber}
                compact
              />
            ) : null}
            {previewTab === "current" ? (
              <VersionPreviewPane
                label="Current Version"
                version={currentPreview}
                currentVersionNumber={currentVersionNumber}
                compact
              />
            ) : null}
            {previewTab === "changes" ? (
              <div className="h-full overflow-y-auto rounded-lg border border-border-light bg-surface-secondary p-4">
                <h3 className="text-sm font-semibold text-text-primary">
                  Change summary
                </h3>
                <div className="mt-3">
                  <VersionChangeSummaryCard summary={changeSummary} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
