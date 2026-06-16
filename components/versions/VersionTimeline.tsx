import { VersionTimelineItem } from "@/components/versions/VersionTimelineItem";
import type { VersionListItem } from "@/lib/versions/versions.service";

type VersionTimelineProps = {
  versions: VersionListItem[];
  selectedVersionNumber: number;
  currentVersionNumber: number;
  onSelect: (versionNumber: number) => void;
};

export function VersionTimeline({
  versions,
  selectedVersionNumber,
  currentVersionNumber,
  onSelect,
}: VersionTimelineProps) {
  return (
    <section className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft xl:w-[240px]">
      <div className="shrink-0 border-b border-border-light px-3 py-2">
        <h2 className="text-sm font-semibold text-text-primary">
          Version Timeline
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">
          {versions.length} saved states
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {versions.map((version) => (
          <VersionTimelineItem
            key={version.id}
            version={version}
            isSelected={version.versionNumber === selectedVersionNumber}
            isCurrent={version.versionNumber === currentVersionNumber}
            onSelect={() => onSelect(version.versionNumber)}
          />
        ))}
      </div>
    </section>
  );
}
