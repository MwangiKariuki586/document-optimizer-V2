import type { FidelityStatus } from "@/components/documents/FidelityBadge";

type EditorStatusBarProps = {
  fidelityStatus: FidelityStatus;
  healthScore?: number;
  readabilityScore?: number;
  seoScore?: number;
};

type MetricPillProps = {
  label: string;
  value: number;
};

const healthScoreByFidelity: Record<FidelityStatus, number> = {
  "Structure Preserved": 86,
  "Original Preserved": 84,
  "Limited Formatting": 64,
  "Plain Text Only": 58,
  "Formatting Review Needed": 62,
};

function getScoreClass(value: number): string {
  if (value >= 80) {
    return "bg-success-muted text-success-foreground";
  }

  if (value >= 65) {
    return "bg-warning-muted text-warning-foreground";
  }

  return "bg-error-muted text-error-foreground";
}

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border-light bg-surface px-3 py-1.5 shadow-card-soft">
      <span className="truncate text-xs font-medium text-text-secondary">
        {label}
      </span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${getScoreClass(value)}`}
      >
        {value}%
      </span>
    </div>
  );
}

export function EditorStatusBar({
  fidelityStatus,
  healthScore,
  readabilityScore = 82,
  seoScore = 79,
}: EditorStatusBarProps) {
  const resolvedHealthScore =
    healthScore ?? healthScoreByFidelity[fidelityStatus];

  return (
    <section className="flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-xl px-3 py-2 ">
      <MetricPill label="Health" value={resolvedHealthScore} />
      <MetricPill label="Readability" value={readabilityScore} />
      <MetricPill label="SEO" value={seoScore} />
    </section>
  );
}
