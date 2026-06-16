import {
  ArrowRight,
  BadgeCheck,
  Cloud,
  Download,
  FileText,
  Gauge,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { AccountUsageTrendChart } from "@/components/usage/AccountUsageTrendChart";
import type {
  AccountActivityItem,
  AccountProfile,
  AccountRecentDocument,
  AccountStorage,
  AccountUsageCategory,
  AccountUsageData,
} from "@/lib/usage/account-usage.service";

type StatCard = AccountUsageData["stats"][number];

const quickActions = [
  { icon: Download, label: "Download usage report" },
  { icon: Cloud, label: "Manage storage" },
  { icon: Settings, label: "Account settings" },
];

const statIconByLabel: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "AI improvements": Sparkles,
  "AI usage": Zap,
  "Documents processed": FileText,
  "Storage used": Cloud,
};

const toneClasses: Record<StatCard["tone"], string> = {
  accent: "bg-accent-lighter text-accent",
  ai: "bg-ai-muted text-ai-dark",
  info: "bg-info-muted text-info-foreground",
  success: "bg-success-muted text-success-foreground",
};

const categoryToneClasses: Record<AccountUsageCategory["tone"], string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
};

const activityIconByType: Record<
  AccountActivityItem["type"],
  React.ComponentType<{ className?: string }>
> = {
  ai: Sparkles,
  document: FileText,
  export: Download,
  suggestion: BadgeCheck,
  upload: Cloud,
};

const activityToneByType: Record<AccountActivityItem["type"], string> = {
  ai: "bg-ai-muted text-ai-dark",
  document: "bg-info-muted text-info-foreground",
  export: "bg-warning-muted text-warning-foreground",
  suggestion: "bg-success-muted text-success-foreground",
  upload: "bg-accent-lighter text-accent",
};

const documentToneClasses: Record<AccountRecentDocument["fileType"], string> = {
  DOCX: "bg-info-muted text-info-foreground",
  MD: "bg-ai-muted text-ai-dark",
  None: "bg-surface-tertiary text-text-secondary",
  PDF: "bg-error-muted text-error-foreground",
  TXT: "bg-surface-tertiary text-text-secondary",
};

function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((card) => {
        const Icon = statIconByLabel[card.label] ?? Gauge;
        const [primaryValue, secondaryValue] = card.value.split(" / ");

        return (
          <article
            key={card.label}
            className="flex min-h-[132px] flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-sm font-semibold leading-5 text-text-primary">
                  {card.label}
                </p>
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[card.tone]}`}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              <p className="mt-3 flex min-w-0 flex-nowrap items-baseline gap-x-1.5 whitespace-nowrap text-[25px] font-bold leading-8 text-text-primary">
                <span>{primaryValue}</span>
                {secondaryValue ? (
                  <>
                    <span className="text-xl leading-7 text-text-primary">
                      /
                    </span>
                    <span className="text-xl leading-7 text-text-primary">
                      {secondaryValue}
                    </span>
                  </>
                ) : null}
              </p>
            </div>

            {card.progressClass ? (
              <div className="mt-3 h-2 rounded-full bg-surface-tertiary">
                <div
                  className={`h-2 rounded-full bg-accent ${card.progressClass}`}
                />
              </div>
            ) : null}
            <p className="mt-3 text-xs leading-4 text-text-secondary">
              {card.helper}
            </p>
          </article>
        );
      })}
    </section>
  );
}

function UsageByCategory({
  categories,
}: {
  categories: AccountUsageCategory[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
      <h2 className="text-lg font-semibold leading-7 text-text-primary">
        Usage by category
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
        <div className="mx-auto flex size-36 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_0_45%,var(--color-info)_45%_70%,var(--color-success)_70%_90%,var(--color-warning)_90%_100%)] p-5">
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
            <p className="text-2xl font-bold text-text-primary">
              {categories
                .reduce(
                  (sum, item) => sum + Number(item.value.replace(/,/g, "")),
                  0,
                )
                .toLocaleString("en-US")}
            </p>
            <p className="text-xs text-text-secondary">Total events</p>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className={`size-3 rounded-full ${categoryToneClasses[item.tone]}`}
              />
              <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                {item.label}
              </span>
              <span className="text-sm text-text-secondary">
                {item.percentage} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentActivityList({ activity }: { activity: AccountActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Recent activity
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          View all
        </button>
      </div>
      {activity.length > 0 ? (
        <div className="mt-4 divide-y divide-border-light">
          {activity.map((item) => {
            const Icon = activityIconByType[item.type];

            return (
              <div
                key={`${item.label}-${item.when}`}
                className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${activityToneByType[item.type]}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {item.label}
                    </p>
                    <p className="truncate text-sm text-text-secondary">
                      {item.meta}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  {item.pill ? (
                    <span className="rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground">
                      {item.pill}
                    </span>
                  ) : null}
                  <span className="text-xs text-text-muted">{item.when}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-surface-secondary p-4 text-sm text-text-secondary">
          No usage activity yet. Create a document or run an AI action to start
          tracking activity.
        </p>
      )}
    </section>
  );
}

function CategoryBreakdown({
  categories,
}: {
  categories: AccountUsageCategory[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Top AI improvement categories
        </h2>
        <button
          type="button"
          className="text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          View details
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {categories.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[82px_1fr_auto] gap-3"
          >
            <span className="text-sm font-medium text-text-primary">
              {item.label}
            </span>
            <div className="mt-1.5 h-2 rounded-full bg-surface-tertiary">
              <div
                className={`h-2 rounded-full ${categoryToneClasses[item.tone]} ${item.progressClass}`}
              />
            </div>
            <span className="text-sm text-text-secondary">
              {item.percentage} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HealthScore({ health }: { health: AccountUsageData["health"] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
      <div className="grid gap-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:items-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-[conic-gradient(var(--color-success)_0_28%,var(--color-accent)_28%_86%,var(--color-accent-light)_86%_100%)] p-3">
          <div className="flex size-full items-center justify-center rounded-full bg-surface text-2xl font-bold text-text-primary">
            {health.score}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-7 text-text-primary">
            Document health score
          </h2>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {health.label}
          </p>
          <p className="mt-1 text-sm text-success-foreground">
            {health.helper}
          </p>
        </div>
      </div>
    </section>
  );
}

function AccountUtilityPanel({
  profile,
  recentDocuments,
  storage,
}: {
  profile: AccountProfile;
  recentDocuments: AccountRecentDocument[];
  storage: AccountStorage;
}) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {profile.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {profile.name}
            </p>
            <p className="truncate text-xs text-text-muted">{profile.email}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-accent-light bg-accent-muted p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
            <BadgeCheck className="size-4" />
            Free workspace
          </div>
          <p className="mt-2 text-xs leading-5 text-text-secondary">
            All document optimization tools are available for free.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Quick actions
        </h2>
        <div className="mt-4 space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-md border border-border-light bg-surface px-3 py-2 text-left text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                <Icon className="size-4 text-accent" />
                <span className="min-w-0 flex-1">{action.label}</span>
                <ArrowRight className="size-4 text-text-muted" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Storage
        </h2>
        <p className="mt-4 text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">
            {storage.usedLabel}
          </span>{" "}
          used
        </p>
        <p className="mt-2 text-sm leading-5 text-text-secondary">
          Original files and exports are stored privately.
        </p>
        <button
          type="button"
          className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent-lighter"
        >
          Manage storage
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold leading-7 text-text-primary">
            Recent documents
          </h2>
          <button
            type="button"
            className="text-sm font-semibold text-accent transition hover:text-accent-dark"
          >
            View all
          </button>
        </div>
        {recentDocuments.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentDocuments.map((document) => (
              <div
                key={document.title}
                className="flex min-w-0 items-center gap-3"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${documentToneClasses[document.fileType]}`}
                >
                  {document.fileType}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
                  {document.title}
                </p>
                <span className="text-xs text-text-muted">{document.when}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-surface-secondary p-4 text-sm text-text-secondary">
            No recent documents yet.
          </p>
        )}
      </section>
    </aside>
  );
}

type AccountUsageWorkspaceProps = {
  data: AccountUsageData;
};

export function AccountUsageWorkspace({ data }: AccountUsageWorkspaceProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <div id="usage" className="space-y-4">
          <StatCards stats={data.stats} />

          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <AccountUsageTrendChart trends={data.trends} />
              <UsageByCategory categories={data.categories} />
            </div>
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
              <RecentActivityList activity={data.activity} />
              <div className="space-y-4">
                <CategoryBreakdown categories={data.categories} />
                <HealthScore health={data.health} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AccountUtilityPanel
        profile={data.profile}
        recentDocuments={data.recentDocuments}
        storage={data.storage}
      />
    </div>
  );
}
