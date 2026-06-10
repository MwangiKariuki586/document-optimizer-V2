import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Download,
  FileCheck,
  FileUp,
  Sparkles,
} from "lucide-react";

type ActivityItem = {
  badge: string;
  description: string;
  kind: "ai" | "export" | "upload" | "version";
  title: string;
  variant: "ai" | "info" | "success" | "warning";
};

type RecentActivityProps = {
  activity: ActivityItem[];
};

const variantClasses: Record<ActivityItem["variant"], string> = {
  ai: "bg-ai-muted text-ai-dark",
  info: "bg-info-muted text-info-foreground",
  success: "bg-success-muted text-success-foreground",
  warning: "bg-warning-muted text-warning-foreground",
};

const activityIcons: Record<ActivityItem["kind"], LucideIcon> = {
  ai: Sparkles,
  export: Download,
  upload: FileUp,
  version: FileCheck,
};

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Recent Activity
        </h2>
        <span className="text-sm font-medium text-accent">View all</span>
      </div>
      <div className="mt-4 min-w-0 divide-y divide-border-light">
        {activity.map(({ badge, description, kind, title, variant }) => {
          const Icon = activityIcons[kind];

          return (
          <div key={`${kind}-${title}`} className="flex min-w-0 items-center gap-3 py-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${variantClasses[variant]}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {title}
              </p>
              <p className="mt-1 text-xs text-text-muted">{description}</p>
            </div>
            <span
              className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${variantClasses[variant]}`}
            >
              {badge}
            </span>
            <ChevronRight className="size-4 text-text-muted" />
          </div>
          );
        })}
      </div>
    </section>
  );
}
