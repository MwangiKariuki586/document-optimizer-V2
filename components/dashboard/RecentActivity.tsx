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
  const visibleActivity = activity.slice(0, 4);

  return (
    <section className="flex h-[260px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Recent Activity
        </h2>
      </div>
      {activity.length > 0 ? (
        <div className="scrollbar-hidden mt-4 min-h-0 flex-1 divide-y divide-border-light overflow-y-auto">
          {visibleActivity.map(
            ({ badge, description, kind, title, variant }) => {
              const Icon = activityIcons[kind];

              return (
                <div
                  key={`${kind}-${title}`}
                  className="flex min-w-0 items-center gap-3 py-3"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${variantClasses[variant]}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {title}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {description}
                    </p>
                  </div>
                  <span
                    className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${variantClasses[variant]}`}
                  >
                    {badge}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-text-muted" />
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center py-5">
          <div className="flex items-start gap-3 rounded-xl bg-surface-secondary px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-text-muted">
              <FileCheck className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                No activity yet.
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Create or update a document to populate this feed.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
