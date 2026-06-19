"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type {
  DashboardUsageOverview,
  DashboardUsageRange,
} from "@/lib/dashboard/dashboard.service";

type ExportFormatItem = {
  count: number;
  format: "PDF" | "DOCX" | "TXT" | "MD" | "Other";
  percentage: number;
  tone: "accent" | "info" | "success" | "warning" | "muted";
};

type UsageSummaryProps = {
  aiActionLimit: number;
  exportFormats: ExportFormatItem[];
  usageOverview: Record<DashboardUsageRange, DashboardUsageOverview>;
};

const dateRangeOptions = [
  "This Week",
  "Today",
  "This Month",
  "This Year",
] as const;

type BarStyle = CSSProperties & {
  "--bar-width": string;
};

type DateRangeSelectProps = {
  label: string;
  onChange: (range: DashboardUsageRange) => void;
  options: DashboardUsageRange[];
  value: DashboardUsageRange;
};

function isDateRangeOption(
  value: string,
  options: DashboardUsageRange[],
): value is DashboardUsageRange {
  return options.some((option) => option === value);
}

function DateRangeSelect({
  label,
  onChange,
  options,
  value,
}: DateRangeSelectProps) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          if (isDateRangeOption(event.target.value, options)) {
            onChange(event.target.value);
          }
        }}
        className="h-10 appearance-none rounded-xl border border-border bg-surface py-2 pl-4 pr-10 text-sm font-medium text-text-secondary outline-none transition hover:bg-surface-secondary focus:border-accent focus:ring-2 focus:ring-accent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-text-muted" />
    </label>
  );
}

const exportToneClasses: Record<ExportFormatItem["tone"], string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  muted: "bg-text-soft",
};

function orderedRanges(
  usageOverview: Record<DashboardUsageRange, DashboardUsageOverview>,
): DashboardUsageRange[] {
  return dateRangeOptions.filter((option) => Boolean(usageOverview[option]));
}

function ringPercent(used: number, limit: number): number {
  if (limit <= 0 || used <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((used / limit) * 100));
}

function visibleBarPercent(percent: number): number {
  if (percent <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(12, percent));
}

function barStyle(percent: number): BarStyle {
  return {
    "--bar-width": `${visibleBarPercent(percent)}%`,
  };
}

function UsageRing({
  limit,
  percent,
  used,
}: {
  limit: number;
  percent: number;
  used: number;
}) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = percent > 0 ? Math.max(3, percent) : 0;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative mx-auto mt-4 flex size-[116px] items-center justify-center">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="var(--color-accent-light)"
          strokeWidth="9"
        />
        <circle
          cx="50"
          cy="50"
          fill="none"
          r={radius}
          stroke="var(--color-accent)"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          strokeWidth="9"
        />
      </svg>

      <div className="relative flex size-[84px] flex-col items-center justify-center rounded-full bg-surface text-center">
        <p className="text-2xl font-bold leading-7 text-text-primary">
          {percent}%
        </p>
        <p className="text-xs leading-4 text-text-muted">
          {used.toLocaleString("en-US")} / {limit.toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}

function exportGradient(exportFormats: ExportFormatItem[]): CSSProperties {
  const total = exportFormats.reduce((sum, item) => sum + item.count, 0);

  if (total <= 0) {
    return {
      background: "conic-gradient(var(--color-surface-tertiary) 0 100%)",
    };
  }

  const colorByTone: Record<ExportFormatItem["tone"], string> = {
    accent: "var(--color-accent)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    muted: "var(--color-text-soft)",
  };
  let cursor = 0;
  const stops = exportFormats
    .filter((item) => item.count > 0)
    .map((item) => {
      const next = cursor + (item.count / total) * 100;
      const stop = `${colorByTone[item.tone]} ${cursor.toFixed(2)}% ${next.toFixed(2)}%`;
      cursor = next;
      return stop;
    });

  return {
    background: `conic-gradient(${stops.join(", ")})`,
  };
}

export function UsageSummary({
  aiActionLimit,
  exportFormats,
  usageOverview,
}: UsageSummaryProps) {
  const ranges = useMemo(() => orderedRanges(usageOverview), [usageOverview]);
  const defaultRange: DashboardUsageRange = ranges.includes("This Week")
    ? "This Week"
    : (ranges[0] ?? "This Month");
  const [selectedRange, setSelectedRange] =
    useState<DashboardUsageRange>(defaultRange);
  const currentUsage =
    usageOverview[selectedRange] ?? usageOverview["This Week"];
  const usage = currentUsage.items;
  const totalExports = exportFormats.reduce((sum, item) => sum + item.count, 0);
  const aiActionsPercent = ringPercent(
    currentUsage.aiActionsUsed,
    aiActionLimit,
  );

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold leading-8 text-text-primary">
            Usage Overview
          </h2>
          <DateRangeSelect
            label="Filter usage overview by date range"
            onChange={setSelectedRange}
            options={ranges}
            value={selectedRange}
          />
        </div>

        <UsageRing
          limit={aiActionLimit}
          percent={aiActionsPercent}
          used={currentUsage.aiActionsUsed}
        />

        <div className="mt-5 space-y-4">
          {usage.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-lg leading-6">
                <span className="min-w-0 truncate text-text-secondary">
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold text-text-primary">
                  {item.value}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-accent-lighter">
                <div
                  className="h-full w-[var(--bar-width)] rounded-full bg-accent transition-[width]"
                  style={barStyle(item.percent)}
                />
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/account#usage"
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-accent-lighter px-4 py-3 text-base font-medium text-accent transition hover:bg-accent-light"
        >
          View Usage Details
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Exports by Format
        </h2>

        <div className="mt-5 grid items-center gap-5 sm:grid-cols-[132px_minmax(0,1fr)]">
          <div
            className="mx-auto flex size-28 items-center justify-center rounded-full p-4"
            style={exportGradient(exportFormats)}
          >
            <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
              <p className="text-2xl font-bold leading-8 text-text-primary">
                {totalExports}
              </p>
              <p className="text-xs text-text-secondary">Total</p>
            </div>
          </div>

          <div className="space-y-3">
            {exportFormats.map((item) => (
              <div key={item.format} className="flex items-center gap-3">
                <span
                  className={`size-3 shrink-0 rounded-full ${exportToneClasses[item.tone]}`}
                />
                <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                  {item.format}
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-dark"
        >
          View full report
          <ArrowRight className="size-4" />
        </button>
      </section>
    </aside>
  );
}
