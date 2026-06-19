import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export type StatCardTone = "accent" | "ai" | "info" | "success";

export type StatCardItem = {
  helper: string;
  icon: LucideIcon;
  label: string;
  progressClass?: string;
  tone: StatCardTone;
  value: string;
};

type StatCardGridProps = {
  className?: string;
  stats: StatCardItem[];
};

const toneClasses: Record<StatCardTone, string> = {
  accent: "bg-accent-lighter text-accent",
  ai: "bg-ai-muted text-ai-dark",
  info: "bg-info-muted text-info-foreground",
  success: "bg-success-muted text-success-foreground",
};

const progressClasses: Record<StatCardTone, string> = {
  accent: "bg-accent",
  ai: "bg-ai",
  info: "bg-info",
  success: "bg-success",
};

function StatValue({ value }: { value: string }) {
  const [primaryValue, secondaryValue] = value.split(" / ");

  if (secondaryValue) {
    return (
      <p className="flex min-w-0 flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap text-3xl font-bold leading-8 text-text-primary">
        <span>{primaryValue}</span>
        <span className="text-xl leading-7 text-text-primary">/</span>
        <span className="text-xl leading-7 text-text-primary">
          {secondaryValue}
        </span>
      </p>
    );
  }

  return (
    <p className="truncate text-3xl font-bold leading-8 text-text-primary">
      {value}
    </p>
  );
}

export function StatCardGrid({ className, stats }: StatCardGridProps) {
  return (
    <section
      className={`grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4 ${className ?? ""}`}
    >
      {stats.map(({ helper, icon: Icon, label, progressClass, tone, value }) => (
        <article
          key={label}
          className="flex h-[120px] min-h-[120px] min-w-0 flex-col justify-between rounded-xl border border-border bg-surface px-4 pt-4 pb-3.5 shadow-card-soft"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-light ${toneClasses[tone]}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-text-primary">
                {label}
              </p>
              <StatValue value={value} />
            </div>
          </div>

          {progressClass ? (
            <div>
              {helper ? (
                <p className="mb-2 text-xs text-text-secondary">{helper}</p>
              ) : null}
              <div className="h-1.5 rounded-full bg-surface-tertiary">
                <div
                  className={`h-1.5 rounded-full ${progressClasses[tone]} ${progressClass}`}
                />
              </div>
            </div>
          ) : (
            <p className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-medium text-success-foreground">
              <ArrowUpRight className="size-3 shrink-0" />
              <span className="truncate">{helper}</span>
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
