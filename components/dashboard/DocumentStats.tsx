import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type DocumentStat = {
  helper: string;
  icon: LucideIcon;
  label: string;
  progressClass?: string;
  value: string;
  variant: "accent" | "ai" | "info" | "success";
};

type DocumentStatsProps = {
  stats: DocumentStat[];
};

const variantClasses: Record<DocumentStat["variant"], string> = {
  accent: "bg-accent-lighter text-accent",
  ai: "bg-ai-muted text-ai-dark",
  info: "bg-info-muted text-info-foreground",
  success: "bg-success-muted text-success-foreground",
};

const progressClasses: Record<DocumentStat["variant"], string> = {
  accent: "bg-accent",
  ai: "bg-ai",
  info: "bg-info",
  success: "bg-success",
};

export function DocumentStats({ stats }: DocumentStatsProps) {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ helper, icon: Icon, label, progressClass, value, variant }) => (
        <article
          key={label}
          className="flex min-h-[112px] min-w-0 flex-col justify-between rounded-xl border border-border bg-surface px-4 py-4 shadow-card-soft"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-light ${variantClasses[variant]}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="whitespace-nowrap text-[11px] font-semibold leading-4 text-text-secondary">
                {label}
              </p>
              <p className="mt-1 text-[26px] font-bold leading-8 text-text-primary">
                {value}
              </p>
            </div>
          </div>

          {progressClass ? (
            <div>
              <p className="mb-2 text-xs text-text-secondary">{helper}</p>
              <div className="h-1.5 rounded-full bg-surface-tertiary">
                <div
                  className={`h-1.5 rounded-full ${progressClasses[variant]} ${progressClass}`}
                />
              </div>
            </div>
          ) : (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-success-foreground">
              <ArrowUpRight className="size-3" />
              {helper}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
