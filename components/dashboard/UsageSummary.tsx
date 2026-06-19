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
  className?: string;
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
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = percent > 0 ? Math.max(3, percent) : 0;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative mx-auto mt-3 flex size-[116px] shrink-0 items-center justify-center self-center">
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
          strokeWidth={strokeWidth}
          style={{ stroke: "var(--color-border)" }}
        />
        {progress > 0 ? (
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            style={{ stroke: "var(--color-accent)" }}
          />
        ) : null}
      </svg>

      <div className="relative flex size-[84px] flex-col items-center justify-center rounded-full border border-border-light bg-surface text-center">
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
  className,
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
    <aside className={`min-w-0 space-y-6 ${className ?? ""}`}>
      <section className="flex h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
        <div className="flex shrink-0 items-center justify-between gap-4">
          <h2 className="text-lg font-semibold leading-7 text-text-primary">
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

        <div className="mt-3 shrink-0 space-y-2.5">
          {usage.map((item) => (
            <div key={item.label}>
              <div className="mb-0.5 flex items-center justify-between gap-4 text-sm leading-5">
                <span className="min-w-0 truncate text-text-secondary">
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold text-text-primary">
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-accent-lighter">
                <div
                  className="h-full w-[var(--bar-width)] rounded-full bg-accent transition-[width]"
                  style={barStyle(item.percent)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto shrink-0 pt-4">
          <Link
            href="/account#usage"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-lighter px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light"
          >
            View Usage Details
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="flex h-[300px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Exports by Format
        </h2>

        <div className="mt-4 grid min-h-0 flex-1 items-center gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
          <div
            className="mx-auto flex size-24 items-center justify-center rounded-full p-3"
            style={exportGradient(exportFormats)}
          >
            <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
              <p className="text-2xl font-bold leading-8 text-text-primary">
                {totalExports}
              </p>
              <p className="text-xs text-text-secondary">Total</p>
            </div>
          </div>

          <div className="min-w-0 space-y-2.5 overflow-hidden">
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
      </section>
    </aside>
  );
}
