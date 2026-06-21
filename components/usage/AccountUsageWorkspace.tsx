"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Cloud,
  CloudUpload,
  Download,
  FileText,
  Gauge,
  History,
  KeyRound,
  Link2,
  ListChecks,
  LockKeyhole,
  LogOut,
  Mail,
  MessageSquareText,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  ShieldUser,
  Sparkles,
  TrendingUp,
  UserRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AccountUsageTrendChart } from "@/components/usage/AccountUsageTrendChart";
import { DateRangeSelect } from "@/components/workspace/DateRangeSelect";
import {
  StatCardGrid,
  type StatCardItem,
} from "@/components/workspace/StatCardGrid";
import type {
  AccountActivityItem,
  AccountHealth,
  AccountProfile,
  AccountStorage,
  AccountUsageCategory,
  AccountUsageData,
  AccountUsageTrendRange,
} from "@/lib/usage/account-usage.service";

const statIconByLabel: Record<string, LucideIcon> = {
  "AI improvements": Sparkles,
  "AI usage": Zap,
  "Documents processed": FileText,
  "Storage used": Cloud,
};

function accountStatItems(stats: AccountUsageData["stats"]): StatCardItem[] {
  return stats.map((stat) => ({
    ...stat,
    icon: statIconByLabel[stat.label] ?? Gauge,
  }));
}

const categoryToneClasses: Record<AccountUsageCategory["tone"], string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
};

const readinessIconByTone: Record<
  AccountHealth["overview"][number]["tone"],
  LucideIcon
> = {
  accent: ShieldAlert,
  info: MessageSquareText,
  success: CheckCircle2,
  warning: ListChecks,
};

const readinessToneClasses: Record<
  AccountHealth["overview"][number]["tone"],
  string
> = {
  accent: "bg-accent-lighter text-accent",
  info: "bg-info-muted text-info",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
};

const readinessValueClasses: Record<
  AccountHealth["overview"][number]["tone"],
  string
> = {
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
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

function UsageByCategory({
  categoriesByRange,
}: {
  categoriesByRange: Record<AccountUsageTrendRange, AccountUsageCategory[]>;
}) {
  const [selectedRange, setSelectedRange] =
    useState<AccountUsageTrendRange>("This Month");
  const categories = categoriesByRange[selectedRange];

  return (
    <section className="flex h-full min-h-[500px] flex-col rounded-2xl border border-border bg-surface px-6 py-4 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold leading-8 text-text-primary">
          Usage by category
        </h2>
        <DateRangeSelect
          ariaLabel="Category date range"
          onChange={setSelectedRange}
          value={selectedRange}
        />
      </div>

      <div className="mt-8 grid flex-1 gap-8 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
        <div className="space-y-6">
          {categories.map((item) => (
            <div key={item.label}>
              <div className="flex items-center gap-3">
                <span
                  className={`size-3 rounded-full ${categoryToneClasses[item.tone]}`}
                />
                <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-text-secondary">
                  {item.percentage} ({item.value})
                </span>
              </div>
              <div className="ml-6 mt-3 h-2 rounded-full bg-accent-lighter">
                <div
                  className={`h-2 rounded-full ${categoryToneClasses[item.tone]} ${item.progressClass}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex size-40 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_0_45%,var(--color-info)_45%_70%,var(--color-success)_70%_90%,var(--color-warning)_90%_100%)] p-5">
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
            <p className="text-3xl font-bold text-text-primary">
              {categories
                .reduce(
                  (sum, item) => sum + Number(item.value.replace(/,/g, "")),
                  0,
                )
                .toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-sm text-text-secondary">Total events</p>
          </div>
        </div>
      </div>

      <Link
        href="/coming-soon?feature=usage-breakdown"
        className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent-lighter px-4 text-sm font-semibold text-accent transition hover:bg-accent-light"
      >
        <BarChart3 className="size-5" />
        View full breakdown
        <ArrowRight className="size-5" />
      </Link>
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
        <Link
          href="/coming-soon?feature=recent-activity"
          className="text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          View all
        </Link>
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

function HealthScore({
  healthByRange,
}: {
  healthByRange: Record<AccountUsageTrendRange, AccountHealth>;
}) {
  const [selectedRange, setSelectedRange] =
    useState<AccountUsageTrendRange>("This Month");
  const health = healthByRange[selectedRange];

  return (
    <section className="flex h-full min-h-[500px] flex-col rounded-2xl border border-border bg-surface px-6 py-4 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold leading-8 text-text-primary">
          Document Readiness
        </h2>
        <DateRangeSelect
          ariaLabel="Readiness date range"
          onChange={setSelectedRange}
          value={selectedRange}
        />
      </div>

      <div className="mt-7 grid flex-1 gap-6 sm:grid-cols-[144px_minmax(0,1fr)] sm:items-center">
        <div className="flex size-36 items-center justify-center rounded-full bg-[conic-gradient(var(--color-success)_0_28%,var(--color-accent)_28%_86%,var(--color-accent-light)_86%_100%)] p-4">
          <div className="flex size-full  items-center justify-center rounded-full bg-surface">
            <span className="text-3xl font-bold text-text-primary">
              {health.score}
            </span>
            <span className="mt-1 text-sm text-text-secondary">/ 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mt-4 space-y-2">
            {health.overview.map((item) => {
              const Icon = readinessIconByTone[item.tone];

              return (
                <div
                  key={item.label}
                  className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border-light px-3 py-2.5"
                >
                  <span
                    className={`flex size-10 items-center justify-center rounded-full ${readinessToneClasses[item.tone]}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {item.helper}
                    </p>
                  </div>
                  <span
                    className={`text-xl font-bold ${readinessValueClasses[item.tone]}`}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Link
        href="/coming-soon?feature=readiness-insights"
        className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent-lighter px-4 text-sm font-semibold text-accent transition hover:bg-accent-light"
      >
        <TrendingUp className="size-5" />
        View readiness insights
        <ArrowRight className="size-5" />
      </Link>
    </section>
  );
}

function AccountUtilityPanel({
  profile,
  storage,
}: {
  profile: AccountProfile;
  storage: AccountStorage;
}) {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isGoogleAccount = user?.externalAccounts.some((account) =>
    account.provider.toLowerCase().includes("google"),
  );
  const lastActiveAt = profile.lastActiveAt
    ? new Date(profile.lastActiveAt)
    : null;
  const lastActiveLabel = lastActiveAt
    ? lastActiveAt.toLocaleString("en-US", {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
      })
    : "Current session";

  const accountControls = [
    {
      icon: CircleUserRound,
      label: "Profile information",
    },
    {
      icon: Mail,
      label: "Email and sign-in",
    },
    {
      icon: LockKeyhole,
      label: "Security settings",
    },
    {
      icon: Link2,
      label: "Connected accounts",
    },
  ];

  const privacyItems = [
    { icon: LockKeyhole, label: "Original files stay private" },
    { icon: Link2, label: "Exports use secure links" },
    { icon: Sparkles, label: "AI changes require preview" },
    { icon: History, label: "Version history protects edits" },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
      <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-card-soft">
            {profile.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {profile.name}
            </p>
            <p className="truncate text-xs text-text-muted">{profile.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3 border-t border-border-light pt-4">
          <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-accent" />
          <div>
            <p className="text-xs font-semibold text-text-primary">
              Personal workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Free document optimization platform
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-accent-light bg-accent-muted px-3 text-xs font-medium text-accent transition hover:bg-accent-lighter"
        >
          <UserRound className="size-4" />
          Manage profile
        </button>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShieldUser className="size-4 text-accent" />
          Account controls
        </h2>
        <div className="mt-3 space-y-1">
          {accountControls.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => openUserProfile()}
              className="group flex min-h-9 w-full items-center gap-3 rounded-md px-1.5 text-left text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
            >
              <item.icon className="size-3.5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">{item.label}</span>
              <ChevronRight className="size-3.5 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Cloud className="size-4 text-accent" />
          Storage management
        </h2>
        <p className="mt-4 text-xs text-text-secondary">
          <span className="text-base font-bold text-text-primary">
            {storage.usedLabel}
          </span>{" "}
          used
        </p>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          Original files and exports are stored privately.
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-accent-light" />
        <div className="mt-3 border-t border-border-light pt-3">
          <Link
            href="/documents"
            className="group flex min-h-9 items-center gap-3 rounded-md px-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <CloudUpload className="size-3.5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">Manage uploaded files</span>
            <ChevronRight className="size-3.5 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShieldCheck className="size-4 text-accent" />
          Data &amp; privacy
        </h2>
        <div className="mt-3 space-y-2.5">
          {privacyItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-1.5">
              <item.icon className="size-3.5 shrink-0 text-accent" />
              <span className="text-xs text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <KeyRound className="size-4 text-accent" />
          Session &amp; access
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <div>
              <p className="text-xs font-medium text-text-primary">
                Signed in with {isGoogleAccount ? "Google" : "email"}
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                {profile.email}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <History className="mt-0.5 size-4 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-medium text-text-primary">
                Last active
              </p>
              <p className="mt-1 text-[11px] text-text-muted">
                {lastActiveLabel}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Monitor className="mt-0.5 size-4 shrink-0 text-accent" />
            <div>
              <p className="text-xs font-medium text-text-primary">
                Active device
              </p>
              <p className="mt-1 text-[11px] text-text-muted">This browser</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-error-light bg-surface px-3 text-xs font-medium text-error-foreground transition hover:bg-error-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
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
          <StatCardGrid stats={accountStatItems(data.stats)} />

          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <UsageByCategory categoriesByRange={data.categories} />
              <HealthScore healthByRange={data.health} />
            </div>
            <AccountUsageTrendChart trends={data.trends} />
          </div>
        </div>
      </div>

      <AccountUtilityPanel
        profile={data.profile}
        storage={data.storage}
      />
    </div>
  );
}
