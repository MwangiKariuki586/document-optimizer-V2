"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

type UsageItem = {
  label: string;
  progressClass: string;
  value: string;
};

type ExportFormatItem = {
  count: number;
  format: "PDF" | "DOCX" | "TXT" | "MD" | "Other";
  percentage: number;
  tone: "accent" | "info" | "success" | "warning" | "muted";
};

type UsageSummaryProps = {
  aiActionLimit: number;
  aiActionsUsed: number;
  exportFormats: ExportFormatItem[];
  usage: UsageItem[];
};

function usageRingClass(percent: number): string {
  if (percent >= 90) {
    return "bg-[conic-gradient(var(--color-accent)_90%,var(--color-accent-light)_0)]";
  }

  if (percent >= 78) {
    return "bg-[conic-gradient(var(--color-accent)_78%,var(--color-accent-light)_0)]";
  }

  if (percent >= 68) {
    return "bg-[conic-gradient(var(--color-accent)_68%,var(--color-accent-light)_0)]";
  }

  if (percent >= 48) {
    return "bg-[conic-gradient(var(--color-accent)_48%,var(--color-accent-light)_0)]";
  }

  if (percent >= 25) {
    return "bg-[conic-gradient(var(--color-accent)_25%,var(--color-accent-light)_0)]";
  }

  return "bg-[conic-gradient(var(--color-accent)_8%,var(--color-accent-light)_0)]";
}

const dateRangeOptions = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
] as const;

type DateRangeOption = (typeof dateRangeOptions)[number];

type DateRangeSelectProps = {
  label: string;
};

function isDateRangeOption(value: string): value is DateRangeOption {
  return dateRangeOptions.some((option) => option === value);
}

function DateRangeSelect({ label }: DateRangeSelectProps) {
  const [selectedRange, setSelectedRange] =
    useState<DateRangeOption>("This Month");

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={selectedRange}
        onChange={(event) => {
          if (isDateRangeOption(event.target.value)) {
            setSelectedRange(event.target.value);
          }
        }}
        className="h-8 appearance-none rounded-md border border-border bg-surface py-1 pl-3 pr-8 text-xs font-medium text-text-secondary outline-none transition hover:bg-surface-secondary focus:border-accent focus:ring-2 focus:ring-accent"
      >
        {dateRangeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-text-muted" />
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

export function UsageSummary({
  aiActionLimit,
  aiActionsUsed,
  exportFormats,
  usage,
}: UsageSummaryProps) {
  const totalExports = exportFormats.reduce((sum, item) => sum + item.count, 0);
  const aiActionsPercent =
    aiActionLimit > 0 ? Math.min(100, Math.round((aiActionsUsed / aiActionLimit) * 100)) : 0;
  const aiActionsUsageText = `${aiActionsUsed.toLocaleString("en-US")} / ${aiActionLimit.toLocaleString("en-US")}`;

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold leading-7 text-text-primary">
            Usage Overview
          </h2>
          <DateRangeSelect label="Filter usage overview by date range" />
        </div>
        <div
          className={`mx-auto mt-4 flex size-28 items-center justify-center rounded-full p-2.5 ${usageRingClass(aiActionsPercent)}`}
        >
          <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
            <p className="text-2xl font-bold text-text-primary">
              {aiActionsPercent}%
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {aiActionsUsageText}
            </p>
            <p className="text-xs text-text-muted">AI actions used</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {usage.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-text-primary">
                  {item.value}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-tertiary">
                <div className={`h-2 rounded-full bg-accent ${item.progressClass}`} />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-md bg-accent-lighter px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light"
        >
          View Usage Details
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Exports by Format
        </h2>

        <div className="mt-5 grid items-center gap-5 sm:grid-cols-[132px_minmax(0,1fr)]">
          <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_0_50%,var(--color-info)_50%_75%,var(--color-success)_75%_87%,var(--color-warning)_87%_95%,var(--color-text-soft)_95%_100%)] p-4">
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
