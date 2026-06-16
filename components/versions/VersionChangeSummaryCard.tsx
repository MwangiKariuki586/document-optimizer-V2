import type { VersionChangeSummary } from "@/lib/versions/version-history.utils";

type VersionChangeSummaryCardProps = {
  summary: VersionChangeSummary;
  isOriginalUpload?: boolean;
  aiSummary?: string | null;
};

export function VersionChangeSummaryCard({
  summary,
  isOriginalUpload = false,
  aiSummary,
}: VersionChangeSummaryCardProps) {
  if (isOriginalUpload) {
    return (
      <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
        <p className="text-sm font-semibold text-text-primary">
          Original upload
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          No previous version to compare.
        </p>
      </div>
    );
  }

  if (aiSummary) {
    return (
      <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
        <p className="text-sm font-semibold text-text-primary">
          AI optimization applied
        </p>
        <p className="mt-1 text-xs text-text-secondary">{aiSummary}</p>
      </div>
    );
  }

  const items = [
    {
      label: "additions",
      value: summary.additions,
      className: "bg-success-muted text-success-foreground",
    },
    {
      label: "deletions",
      value: summary.deletions,
      className: "bg-error-muted text-error-foreground",
    },
    {
      label: "modifications",
      value: summary.modifications,
      className: "bg-info-muted text-info-foreground",
    },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between rounded-lg border border-border-light bg-surface px-3 py-2"
        >
          <span className="text-sm text-text-secondary">{item.label}</span>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${item.className}`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
