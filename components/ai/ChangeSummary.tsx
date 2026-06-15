import { ShieldCheck } from "lucide-react";

export type ChangeSummaryType =
  | "clarity"
  | "grammar"
  | "tone"
  | "structure"
  | "seo";

type ChangeSummaryProps = {
  summary: string;
  counts: Record<ChangeSummaryType, number>;
  totalChanges: number;
};

const labels: Record<ChangeSummaryType, string> = {
  clarity: "Clarity",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
  seo: "SEO",
};

const metricClasses: Record<ChangeSummaryType, string> = {
  clarity: "bg-ai-light text-ai-dark",
  grammar: "bg-success-muted text-success-foreground",
  tone: "bg-warning-muted text-warning-foreground",
  structure: "bg-info-muted text-info-foreground",
  seo: "bg-accent-light text-accent",
};

export function ChangeSummary({
  summary,
  counts,
  totalChanges,
}: ChangeSummaryProps) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0) as Array<
    [ChangeSummaryType, number]
  >;
  const visibleEntries =
    entries.length > 0
      ? entries
      : (["clarity", "grammar", "tone", "structure"] as ChangeSummaryType[]).map(
          (type): [ChangeSummaryType, number] => [type, 0],
        );

  return (
    <section className="grid shrink-0 gap-2 xl:grid-cols-[150px_minmax(0,1fr)_320px]">
      <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card-soft">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-light text-lg font-bold text-accent">
            {totalChanges}
          </span>
          <div>
            <p className="text-xs font-semibold leading-4 text-text-primary">
              changes proposed
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
              Across {entries.length || 4} key areas
            </p>
          </div>
        </div>
      </div>

      <div className="grid rounded-xl border border-border bg-surface shadow-card-soft sm:grid-cols-2 xl:grid-cols-4">
        {visibleEntries.map(([type, count], index) => (
          <div
            key={type}
            className={`flex items-center gap-2.5 px-3 py-2.5 ${
              index > 0 ? "border-t border-border-light sm:border-t-0 sm:border-l" : ""
            }`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${metricClasses[type]}`}
            >
              {count}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-4 text-text-primary">
                {labels[type]}
              </p>
              <p className="text-[11px] leading-4 text-text-secondary">
                Improvements
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card-soft">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
            <ShieldCheck className="size-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold leading-4 text-text-primary">
              Preview only - your document has not changed yet.
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-text-secondary">
              {summary ||
                "A version snapshot will be created before applying this proposed result."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
