"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  AccountUsageTrendRange,
  AccountUsageTrendSeries,
} from "@/lib/usage/account-usage.service";

type AccountUsageTrendChartProps = {
  trends: Record<AccountUsageTrendRange, AccountUsageTrendSeries>;
};

const rangeOptions: AccountUsageTrendRange[] = [
  "This Month",
  "This Week",
  "Today",
  "This Year",
];

function pointToCoordinates(
  value: number,
  index: number,
  total: number,
  yAxisMax: number,
) {
  const x = total <= 1 ? 0 : (index / (total - 1)) * 100;
  const y = 100 - Math.min(100, Math.round((value / yAxisMax) * 100));

  return { x, y };
}

function visibleXAxisLabels(points: AccountUsageTrendSeries["points"]) {
  if (points.length <= 4) {
    return points.map((point, index) => ({ index, label: point.label }));
  }

  const last = points.length - 1;
  const indexes = Array.from(
    new Set([0, Math.round(last * 0.33), Math.round(last * 0.66), last]),
  );

  return indexes.map((index) => ({ index, label: points[index].label }));
}

function calloutPositionClass(point: { x: number; y: number }) {
  const leftClass =
    point.x < 20
      ? "left-[18%]"
      : point.x > 80
        ? "left-[82%]"
        : point.x > 62
          ? "left-[68%]"
          : point.x > 38
            ? "left-1/2"
            : "left-[32%]";
  const topClass =
    point.y < 22
      ? "top-[18%]"
      : point.y > 70
        ? "top-[66%]"
        : point.y > 48
          ? "top-[54%]"
          : "top-[34%]";

  return `${leftClass} ${topClass}`;
}

export function AccountUsageTrendChart({
  trends,
}: AccountUsageTrendChartProps) {
  const [selectedRange, setSelectedRange] =
    useState<AccountUsageTrendRange>("This Month");
  const series = trends[selectedRange];
  const coordinates = useMemo(
    () =>
      series.points.map((point, index) =>
        pointToCoordinates(
          point.value,
          index,
          series.points.length,
          series.yAxisMax,
        ),
      ),
    [series],
  );
  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const calloutPoint = coordinates[series.calloutIndex] ?? coordinates[0];
  const calloutData = series.points[series.calloutIndex] ?? series.points[0];
  const xAxisLabels = visibleXAxisLabels(series.points);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          AI usage trend
        </h2>
        <label className="relative inline-flex items-center">
          <span className="sr-only">Usage trend date range</span>
          <select
            value={selectedRange}
            onChange={(event) =>
              setSelectedRange(event.target.value as AccountUsageTrendRange)
            }
            className="h-10 appearance-none rounded-xl border border-border bg-surface py-2 pl-4 pr-9 text-sm font-medium text-text-secondary outline-none transition hover:bg-surface-secondary focus:border-accent focus:ring-2 focus:ring-accent"
          >
            {rangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4 text-text-muted" />
        </label>
      </div>

      <div className="mt-5 grid h-64 grid-cols-[44px_minmax(0,1fr)] gap-4">
        <div className="flex flex-col justify-between pb-8 text-sm text-text-muted">
          {series.yAxisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="relative min-w-0 pb-8">
          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
            {series.yAxisLabels.map((label) => (
              <span key={label} className="h-px w-full bg-border-light" />
            ))}
          </div>

          <svg
            aria-label={`${selectedRange} AI token usage trend`}
            className="absolute inset-x-0 top-0 bottom-8 h-[calc(100%-2rem)] w-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <path
              d={`${path} L 100 100 L 0 100 Z`}
              fill="var(--color-accent-lighter)"
              opacity="0.9"
            />
            <path
              d={path}
              fill="none"
              stroke="var(--color-accent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              vectorEffect="non-scaling-stroke"
            />
            {calloutPoint ? (
              <circle
                cx={calloutPoint.x}
                cy={calloutPoint.y}
                fill="var(--color-surface)"
                r="2.2"
                stroke="var(--color-accent)"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>

          {calloutPoint && calloutData ? (
            <div
              className={`absolute z-10 min-w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface px-4 py-3 text-center text-sm shadow-popover ${calloutPositionClass(calloutPoint)}`}
            >
              <p className="font-semibold text-text-primary">
                {calloutData.label}
              </p>
              <p className="mt-1 text-text-muted">
                {calloutData.value.toLocaleString("en-US")} tokens
              </p>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 flex justify-between text-sm text-text-muted">
            {xAxisLabels.map((item) => (
              <span key={`${item.index}-${item.label}`}>{item.label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
