import { CheckCircle2, Sparkles } from "lucide-react";

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
  clarity: "clarity improvements",
  grammar: "grammar fixes",
  tone: "tone adjustments",
  structure: "structure improvements",
  seo: "SEO improvements",
};

const chipClasses: Record<ChangeSummaryType, string> = {
  clarity: "bg-ai-light text-ai-dark",
  grammar: "bg-success-muted text-success-foreground",
  tone: "bg-info-muted text-info-foreground",
  structure: "bg-warning-muted text-warning-foreground",
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

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai-muted text-ai-dark">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {totalChanges > 0
                  ? `${totalChanges} change${totalChanges === 1 ? "" : "s"} proposed`
                  : "AI prepared a revised version"}
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {summary ||
                  "AI prepared a revised version focused on clarity, tone, and structure."}
              </p>
            </div>
          </div>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-xs font-semibold text-success-foreground">
          <CheckCircle2 className="size-3.5" />
          Preview only
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {entries.length > 0 ? (
          entries.map(([type, count]) => (
            <span
              key={type}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${chipClasses[type]}`}
            >
              {count} {labels[type]}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-ai-light px-2.5 py-1 text-xs font-medium text-ai-dark">
            Focused on clarity, tone, and structure
          </span>
        )}
      </div>

      <p className="mt-3 text-xs font-medium text-text-muted">
        Preview only - your document has not changed yet.
      </p>
    </section>
  );
}
