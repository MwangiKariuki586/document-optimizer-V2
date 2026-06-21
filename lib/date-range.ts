export const DATE_RANGE_OPTIONS = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
] as const;

export type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];
