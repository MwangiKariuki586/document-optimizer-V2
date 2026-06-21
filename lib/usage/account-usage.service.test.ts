import { describe, expect, it } from "vitest";

import {
  formatAIActivityMeta,
  getUsageRangeStartIso,
} from "@/lib/usage/account-usage.service";

describe("formatAIActivityMeta", () => {
  it("uses the provider and model when both are available", () => {
    expect(formatAIActivityMeta("gemini", "gemini-2.5-flash")).toBe(
      "gemini gemini-2.5-flash",
    );
  });

  it("uses meaningful fallbacks when provider or model are missing", () => {
    expect(formatAIActivityMeta(null, null)).toBe("AI model");
    expect(formatAIActivityMeta("gemini", undefined)).toBe("gemini model");
  });
});

describe("getUsageRangeStartIso", () => {
  const now = new Date(2026, 5, 17, 14, 30, 0);

  it("starts today and this week at local midnight", () => {
    const today = new Date(getUsageRangeStartIso("Today", now));
    const week = new Date(getUsageRangeStartIso("This Week", now));

    expect(today.getHours()).toBe(0);
    expect(today.getDate()).toBe(17);
    expect(week.getHours()).toBe(0);
    expect(week.getDay()).toBe(1);
    expect(week.getDate()).toBe(15);
  });

  it("starts month and year ranges at their first local day", () => {
    const month = new Date(getUsageRangeStartIso("This Month", now));
    const year = new Date(getUsageRangeStartIso("This Year", now));

    expect(month.getDate()).toBe(1);
    expect(month.getMonth()).toBe(5);
    expect(year.getDate()).toBe(1);
    expect(year.getMonth()).toBe(0);
  });
});
