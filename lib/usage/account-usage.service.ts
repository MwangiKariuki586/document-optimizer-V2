import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

type DocumentRow = Pick<
  Tables<"documents">,
  | "created_at"
  | "file_type"
  | "id"
  | "original_file_key"
  | "source_type"
  | "title"
  | "updated_at"
  | "word_count"
>;

type AIRequestRow = Pick<
  Tables<"ai_requests">,
  | "action"
  | "created_at"
  | "estimated_cost"
  | "input_tokens"
  | "model"
  | "output_tokens"
  | "provider"
  | "status"
>;

type SuggestionRow = Pick<Tables<"suggestions">, "created_at" | "status" | "type">;

type ExportRow = Pick<Tables<"exports">, "created_at" | "format" | "status">;

type UsageRow = Pick<
  Tables<"usage_ledger">,
  | "created_at"
  | "estimated_cost"
  | "event_type"
  | "input_tokens"
  | "metadata"
  | "model"
  | "output_tokens"
  | "provider"
>;

export type AccountProfile = {
  email: string;
  initials: string;
  name: string;
};

export type AccountStat = {
  helper: string;
  label: string;
  progressClass?: string;
  tone: "accent" | "ai" | "info" | "success";
  value: string;
};

export type AccountUsageCategory = {
  label: string;
  percentage: string;
  progressClass: string;
  tone: "accent" | "info" | "success" | "warning";
  value: string;
};

export type AccountActivityItem = {
  label: string;
  meta: string;
  pill?: string;
  type: "ai" | "document" | "export" | "suggestion" | "upload";
  when: string;
};

export type AccountRecentDocument = {
  fileType: "DOCX" | "PDF" | "TXT" | "MD" | "None";
  title: string;
  when: string;
};

export type AccountStorage = {
  usedLabel: string;
};

export type AccountUsageTrendRange =
  | "This Month"
  | "This Week"
  | "This Year"
  | "Today";

export type AccountUsageTrendPoint = {
  label: string;
  tooltipLabel: string;
  value: number;
};

export type AccountUsageTrendSeries = {
  calloutIndex: number;
  points: AccountUsageTrendPoint[];
  yAxisLabels: string[];
  yAxisMax: number;
};

export type AccountUsageData = {
  activity: AccountActivityItem[];
  categories: AccountUsageCategory[];
  health: {
    helper: string;
    label: string;
    score: number;
  };
  profile: AccountProfile;
  recentDocuments: AccountRecentDocument[];
  stats: AccountStat[];
  storage: AccountStorage;
  trends: Record<AccountUsageTrendRange, AccountUsageTrendSeries>;
};

const formatCount = new Intl.NumberFormat("en-US");

function getMonthStartIso(): string {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return monthStart.toISOString();
}

function getYearStartIso(): string {
  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);

  return yearStart.toISOString();
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function progressClass(value: number, limit: number): string {
  if (limit <= 0 || value <= 0) return "w-0";

  const percent = Math.min(100, Math.round((value / limit) * 100));

  if (percent >= 90) return "w-[90%]";
  if (percent >= 78) return "w-[78%]";
  if (percent >= 68) return "w-[68%]";
  if (percent >= 62) return "w-[62%]";
  if (percent >= 48) return "w-[48%]";
  if (percent >= 36) return "w-[36%]";
  if (percent >= 25) return "w-1/4";
  return "w-[12%]";
}

function formatActionLabel(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function normalizeFileType(fileType: string): AccountRecentDocument["fileType"] {
  switch (fileType.toLowerCase()) {
    case "docx":
      return "DOCX";
    case "pdf":
      return "PDF";
    case "markdown":
    case "md":
      return "MD";
    case "txt":
      return "TXT";
    default:
      return "None";
  }
}

function sumTokens(rows: Array<Pick<AIRequestRow | UsageRow, "input_tokens" | "output_tokens">>) {
  return rows.reduce(
    (sum, row) => sum + (row.input_tokens ?? 0) + (row.output_tokens ?? 0),
    0,
  );
}

function rowTokenCount(row: Pick<AIRequestRow | UsageRow, "input_tokens" | "output_tokens">): number {
  return (row.input_tokens ?? 0) + (row.output_tokens ?? 0);
}

function categoryForAction(action: string): AccountUsageCategory["label"] {
  if (["tone_analyze", "rewrite"].includes(action)) return "Tone";
  if (["analyze", "optimize"].includes(action)) return "Structure";
  if (action === "seo_analyze") return "SEO";
  return "Clarity";
}

function buildCategories(aiRows: AIRequestRow[], suggestionRows: SuggestionRow[]) {
  const counts = new Map<AccountUsageCategory["label"], number>([
    ["Clarity", 0],
    ["Tone", 0],
    ["Structure", 0],
    ["SEO", 0],
  ]);

  for (const row of aiRows) {
    const key = categoryForAction(row.action);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  for (const row of suggestionRows) {
    const key =
      row.type === "tone"
        ? "Tone"
        : row.type === "structure"
          ? "Structure"
          : row.type === "seo"
            ? "SEO"
            : "Clarity";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  const toneByCategory: Record<AccountUsageCategory["label"], AccountUsageCategory["tone"]> = {
    Clarity: "accent",
    Tone: "info",
    Structure: "success",
    SEO: "warning",
  };

  return Array.from(counts.entries()).map(([label, value]) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return {
      label,
      percentage: `${percentage}%`,
      progressClass: progressClass(value, total),
      tone: toneByCategory[label],
      value: formatCount.format(value),
    };
  });
}

function formatCompactTokenValue(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return `${value}`;
}

function buildYAxisLabels(yAxisMax: number): string[] {
  return [1, 0.8, 0.6, 0.4, 0.2, 0].map((ratio) =>
    formatCompactTokenValue(Math.round(yAxisMax * ratio)),
  );
}

function buildTrendSeries(
  range: AccountUsageTrendRange,
  aiRows: AIRequestRow[],
  usageRows: UsageRow[],
): AccountUsageTrendSeries {
  const now = new Date();
  const bucketDates: Date[] = [];

  if (range === "Today") {
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    for (let hour = 0; hour < 24; hour += 3) {
      const date = new Date(todayStart);
      date.setHours(hour, 0, 0, 0);
      bucketDates.push(date);
    }
  } else if (range === "This Week") {
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - index);
      date.setHours(0, 0, 0, 0);
      bucketDates.push(date);
    }
  } else if (range === "This Year") {
    for (let month = 0; month <= now.getMonth(); month += 1) {
      const date = new Date(now.getFullYear(), month, 1);
      bucketDates.push(date);
    }
  } else {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const bucketCount = 10;

    for (let index = 0; index < bucketCount; index += 1) {
      const day = Math.min(
        daysInMonth,
        1 + Math.round((index * (daysInMonth - 1)) / (bucketCount - 1)),
      );
      bucketDates.push(new Date(now.getFullYear(), now.getMonth(), day));
    }
  }

  const values = bucketDates.map(() => 0);
  const rows = [...aiRows, ...usageRows];

  for (const row of rows) {
    const createdAt = new Date(row.created_at);
    let bucketIndex = -1;

    if (range === "Today") {
      const sameDate = createdAt.toDateString() === now.toDateString();
      bucketIndex = sameDate ? Math.min(7, Math.floor(createdAt.getHours() / 3)) : -1;
    } else if (range === "This Week") {
      bucketIndex = bucketDates.findIndex(
        (date) => date.toDateString() === createdAt.toDateString(),
      );
    } else if (range === "This Year") {
      bucketIndex =
        createdAt.getFullYear() === now.getFullYear() ? createdAt.getMonth() : -1;
    } else if (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth()
    ) {
      const closest = bucketDates.reduce(
        (best, date, index) => {
          const diff = Math.abs(date.getDate() - createdAt.getDate());
          return diff < best.diff ? { diff, index } : best;
        },
        { diff: Number.POSITIVE_INFINITY, index: -1 },
      );
      bucketIndex = closest.index;
    }

    if (bucketIndex >= 0) {
      values[bucketIndex] += rowTokenCount(row);
    }
  }

  const maxValue = Math.max(...values, 0);
  const yAxisMax = Math.max(10000, Math.ceil(maxValue / 1000) * 1000);
  const calloutIndex = values.reduce(
    (bestIndex, value, index) => (value >= values[bestIndex] ? index : bestIndex),
    0,
  );

  return {
    calloutIndex,
    points: bucketDates.map((date, index) => {
      const value = values[index];
      const label =
        range === "Today"
          ? date.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })
          : range === "This Year"
            ? date.toLocaleDateString("en-US", { month: "short" })
            : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        label,
        tooltipLabel: `${label}\n${formatCount.format(value)} tokens`,
        value,
      };
    }),
    yAxisLabels: buildYAxisLabels(yAxisMax),
    yAxisMax,
  };
}

function buildTrends(
  aiRows: AIRequestRow[],
  usageRows: UsageRow[],
): Record<AccountUsageTrendRange, AccountUsageTrendSeries> {
  return {
    Today: buildTrendSeries("Today", aiRows, usageRows),
    "This Month": buildTrendSeries("This Month", aiRows, usageRows),
    "This Week": buildTrendSeries("This Week", aiRows, usageRows),
    "This Year": buildTrendSeries("This Year", aiRows, usageRows),
  };
}

function estimateStorageUsedBytes(documents: DocumentRow[], exports: ExportRow[]): number {
  const documentBytes = documents.reduce((sum, document) => {
    const wordEstimate = Math.max(document.word_count, 1) * 8;
    const originalFileEstimate = document.original_file_key ? 350_000 : 0;

    return sum + wordEstimate + originalFileEstimate;
  }, 0);
  const exportBytes = exports.length * 180_000;

  return documentBytes + exportBytes;
}

function formatStorage(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  }

  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function buildActivity(
  documents: DocumentRow[],
  aiRows: AIRequestRow[],
  exports: ExportRow[],
  suggestions: SuggestionRow[],
): AccountActivityItem[] {
  const items: Array<AccountActivityItem & { createdAt: string }> = [];

  for (const row of documents.slice(0, 6)) {
    items.push({
      createdAt: row.created_at,
      label: row.title,
      meta: row.source_type === "upload" ? "Document uploaded" : "Document created",
      type: row.source_type === "upload" ? "upload" : "document",
      when: formatRelativeDate(row.created_at),
    });
  }

  for (const row of aiRows.slice(0, 6)) {
    items.push({
      createdAt: row.created_at,
      label: `${formatActionLabel(row.action)} completed`,
      meta: `${row.provider ?? "AI"} ${row.model ?? "provider"}`,
      pill: row.output_tokens ? `${formatCount.format(row.output_tokens)} output tokens` : undefined,
      type: "ai",
      when: formatRelativeDate(row.created_at),
    });
  }

  for (const row of exports.slice(0, 6)) {
    items.push({
      createdAt: row.created_at,
      label: `${row.format.toUpperCase()} export generated`,
      meta: row.status === "completed" ? "Export ready" : "Export processing",
      type: "export",
      when: formatRelativeDate(row.created_at),
    });
  }

  for (const row of suggestions.slice(0, 6)) {
    items.push({
      createdAt: row.created_at,
      label: `${formatActionLabel(row.type)} suggestion ${row.status}`,
      meta: row.status === "applied" ? "Improvement applied" : "Suggestion created",
      type: "suggestion",
      when: formatRelativeDate(row.created_at),
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((item) => ({
      label: item.label,
      meta: item.meta,
      pill: item.pill,
      type: item.type,
      when: item.when,
    }));
}

function buildEmptyData(profile: AccountProfile): AccountUsageData {
  return {
    activity: [],
    categories: buildCategories([], []),
    health: {
      helper: "Create documents to build a health score.",
      label: "No score yet",
      score: 0,
    },
    profile,
    recentDocuments: [],
    stats: [
      {
        helper: "Tokens used this month",
        label: "AI usage",
        tone: "accent",
        value: "0 tokens",
      },
      { helper: "0 uploaded", label: "Documents processed", tone: "info", value: "0" },
      { helper: "0 applied", label: "AI improvements", tone: "success", value: "0" },
      {
        helper: "Private files and exports",
        label: "Storage used",
        tone: "ai",
        value: "0 KB used",
      },
    ],
    storage: {
      usedLabel: "0 KB",
    },
    trends: buildTrends([], []),
  };
}

export function getEmptyAccountUsageData(profile: AccountProfile): AccountUsageData {
  return buildEmptyData(profile);
}

export async function getAccountUsageData(
  userId: string,
  profile: AccountProfile,
): Promise<AccountUsageData> {
  const supabase = createSupabaseServerClient();
  const monthStartIso = getMonthStartIso();
  const yearStartIso = getYearStartIso();

  const [
    { data: documentData, error: documentError },
    { data: aiData, error: aiError },
    { data: suggestionData, error: suggestionError },
    { data: exportData, error: exportError },
    { data: usageData, error: usageError },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id,title,source_type,file_type,original_file_key,word_count,created_at,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("ai_requests")
      .select("action,status,provider,model,input_tokens,output_tokens,estimated_cost,created_at")
      .eq("user_id", userId)
      .gte("created_at", yearStartIso)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("suggestions")
      .select("type,status,created_at")
      .eq("user_id", userId)
      .gte("created_at", monthStartIso)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("exports")
      .select("format,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("usage_ledger")
      .select("event_type,provider,model,input_tokens,output_tokens,estimated_cost,metadata,created_at")
      .eq("user_id", userId)
      .gte("created_at", yearStartIso)
      .order("created_at", { ascending: false })
      .limit(800),
  ]);

  if (documentError || aiError || suggestionError || exportError || usageError) {
    throw new Error("Failed to load account usage data");
  }

  const documents = (documentData ?? []) as DocumentRow[];
  const aiRows = (aiData ?? []) as AIRequestRow[];
  const suggestionRows = (suggestionData ?? []) as SuggestionRow[];
  const exportRows = (exportData ?? []) as ExportRow[];
  const usageRows = (usageData ?? []) as UsageRow[];
  const monthAiRows = aiRows.filter((row) => row.created_at >= monthStartIso);
  const monthUsageRows = usageRows.filter((row) => row.created_at >= monthStartIso);
  const tokenTotal = Math.max(sumTokens(monthAiRows), sumTokens(monthUsageRows));
  const appliedSuggestions = suggestionRows.filter((row) => row.status === "applied").length;
  const uploadedDocuments = documents.filter((row) => row.source_type === "upload").length;
  const storageUsedBytes = estimateStorageUsedBytes(documents, exportRows);
  const recentDocuments = documents.slice(0, 4).map((document) => ({
    fileType: normalizeFileType(document.file_type),
    title: document.title,
    when: formatRelativeDate(document.updated_at),
  }));
  const healthScore =
    documents.length > 0
      ? Math.min(100, 60 + Math.min(30, Math.round(appliedSuggestions / 2)) + Math.min(10, exportRows.length))
      : 0;

  return {
    activity: buildActivity(documents, aiRows, exportRows, suggestionRows),
    categories: buildCategories(monthAiRows, suggestionRows),
    health: {
      helper:
        healthScore > 0
          ? `${formatCount.format(appliedSuggestions)} improvements applied this month`
          : "Create documents to build a health score.",
      label: healthScore >= 85 ? "Great" : healthScore >= 70 ? "Good" : healthScore > 0 ? "Needs review" : "No score yet",
      score: healthScore,
    },
    profile,
    recentDocuments,
    stats: [
      {
        helper: "Tokens used this month",
        label: "AI usage",
        tone: "accent",
        value: `${formatCount.format(tokenTotal)} tokens`,
      },
      {
        helper: `${formatCount.format(uploadedDocuments)} uploaded`,
        label: "Documents processed",
        tone: "info",
        value: formatCount.format(documents.length),
      },
      {
        helper: `${formatCount.format(appliedSuggestions)} applied`,
        label: "AI improvements",
        tone: "success",
        value: formatCount.format(suggestionRows.length),
      },
      {
        helper: "Private files and exports",
        label: "Storage used",
        tone: "ai",
        value: `${formatStorage(storageUsedBytes)} used`,
      },
    ],
    storage: {
      usedLabel: formatStorage(storageUsedBytes),
    },
    trends: buildTrends(aiRows, usageRows),
  };
}
