import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ChevronRight } from "lucide-react";

export type StatCardTone = "accent" | "ai" | "info" | "success";

export type StatCardItem = {
  action?: string;
  helper: string;
  icon: LucideIcon;
  label: string;
  meta?: string;
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

const actionToneClasses: Record<StatCardTone, string> = {
  accent: "text-accent",
  ai: "text-ai-dark",
  info: "text-info-foreground",
  success: "text-success-foreground",
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
      <p className="flex min-w-0 flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap text-[2rem] font-bold leading-9 tracking-tight text-text-primary">
        <span>{primaryValue}</span>
        <span className="text-xl leading-7 text-text-muted">/</span>
        <span className="text-xl leading-7 text-text-primary">
          {secondaryValue}
        </span>
      </p>
    );
  }

  return (
    <p className="truncate text-[2rem] font-bold leading-9 tracking-tight text-text-primary">
      {value}
    </p>
  );
}

export function StatCardGrid({ className, stats }: StatCardGridProps) {
  return (
    <section
      className={`grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4 ${className ?? ""}`}
    >
      {stats.map(
        ({
          action,
          helper,
          icon: Icon,
          label,
          meta,
          progressClass,
          tone,
          value,
        }) => (
          <article
            key={label}
            className="flex min-h-[152px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft"
          >
            <div className="flex min-w-0 items-center gap-2.5 px-4 pt-3.5 pb-3">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}
              >
                <Icon className="size-3.5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-5 text-text-primary">
                  {label}
                </p>
                {meta ? (
                  <p className="truncate text-xs leading-4 text-text-muted">
                    {meta}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-19 flex-1 flex-col justify-center px-4 py-3">
              <StatValue value={value} />
              {helper ? (
                <p className="mt-1 truncate text-sm leading-5 text-text-secondary">
                  {helper}
                </p>
              ) : null}
            </div>

            {progressClass ? (
              <div className="  px-4 py-4.5">
                <div className="h-1.5 rounded-full bg-surface-tertiary">
                  <div
                    className={`h-1.5 rounded-full ${progressClasses[tone]} ${progressClass}`}
                  />
                </div>
              </div>
            ) : action ? (
              <div className="  px-4 py-2.5">
                <p
                  className={`inline-flex min-w-0 w-full items-center gap-1.5 text-xs font-medium ${actionToneClasses[tone]}`}
                >
                  <ArrowUpRight
                    className="size-3 shrink-0"
                    strokeWidth={2.25}
                  />
                  <span className="truncate">{action}</span>
                  <ChevronRight className="ml-auto size-3.5 shrink-0 text-text-muted" />
                </p>
              </div>
            ) : null}
          </article>
        ),
      )}
    </section>
  );
}
