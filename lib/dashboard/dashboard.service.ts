import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DateRangeOption } from "@/lib/date-range";
import type { Tables } from "@/lib/supabase/types";

type DocumentRow = Pick<
  Tables<"documents">,
  | "created_at"
  | "fidelity_status"
  | "file_type"
  | "id"
  | "source_type"
  | "status"
  | "title"
  | "updated_at"
  | "word_count"
>;

type AIRequestRow = Pick<
  Tables<"ai_requests">,
  "action" | "created_at" | "document_id" | "status"
>;

type VersionRow = Pick<
  Tables<"document_versions">,
  "created_at" | "document_id" | "source" | "title"
>;

type ExportRow = Pick<
  Tables<"exports">,
  "created_at" | "document_id" | "format" | "status"
>;

type SuggestionRow = Pick<
  Tables<"suggestions">,
  "created_at" | "document_id" | "id" | "status" | "type"
>;

export type DashboardRecentDocument = {
  fidelity:
    | "Structure Preserved"
    | "Original Preserved"
    | "Limited Formatting"
    | "Plain Text Only"
    | "Formatting Review Needed";
  folder: string;
  href: string;
  id: string;
  status: "Ready" | "Draft" | "Processing" | "Failed" | "Archived";
  title: string;
  type: "DOCX" | "PDF" | "MD" | "TXT" | "None";
  updated: string;
  words: string;
};

export type DashboardUsageItem = {
  label: string;
  percent: number;
  value: string;
};

export type DashboardUsageRange = DateRangeOption;

export type DashboardUsageOverview = {
  aiActionsUsed: number;
  items: DashboardUsageItem[];
  rangeLabel: DashboardUsageRange;
  value: string;
};

export type DashboardExportFormat = {
  count: number;
  format: "PDF" | "DOCX" | "TXT" | "MD" | "Other";
  percentage: number;
  tone: "accent" | "info" | "success" | "warning" | "muted";
};

export type DashboardActivityItem = {
  badge: string;
  description: string;
  kind: "ai" | "export" | "upload" | "version";
  title: string;
  variant: "ai" | "info" | "success" | "warning";
};

export type DashboardSuggestionItem = {
  documentTitle: string;
  impact: string;
  kind: "clarity" | "grammar" | "seo" | "structure" | "tone";
  title: string;
  variant: "ai" | "info" | "warning";
};

export type DashboardMetrics = {
  aiActionsThisMonth: number;
  aiActionsUsed: number;
  avgQualityScore: number;
  documentsThisMonth: number;
  exportsThisMonth: number;
  totalDocuments: number;
  totalExports: number;
};

export type DashboardData = {
  activity: DashboardActivityItem[];
  exportFormats: DashboardExportFormat[];
  metrics: DashboardMetrics;
  recentDocuments: DashboardRecentDocument[];
  suggestions: DashboardSuggestionItem[];
  usage: DashboardUsageItem[];
  usageOverview: Record<DashboardUsageRange, DashboardUsageOverview>;
};

const emptyDashboardData: DashboardData = {
  activity: [],
  exportFormats: [
    { format: "PDF", count: 0, percentage: 0, tone: "accent" },
    { format: "DOCX", count: 0, percentage: 0, tone: "info" },
    { format: "TXT", count: 0, percentage: 0, tone: "success" },
    { format: "MD", count: 0, percentage: 0, tone: "warning" },
    { format: "Other", count: 0, percentage: 0, tone: "muted" },
  ],
  metrics: {
    aiActionsThisMonth: 0,
    aiActionsUsed: 0,
    avgQualityScore: 0,
    documentsThisMonth: 0,
    exportsThisMonth: 0,
    totalDocuments: 0,
    totalExports: 0,
  },
  recentDocuments: [],
  suggestions: [],
  usage: [
    { label: "AI Suggestions", value: "0", percent: 0 },
    { label: "Structure Analysis", value: "0", percent: 0 },
    { label: "Tone & Clarity", value: "0", percent: 0 },
    { label: "Enhancements", value: "0", percent: 0 },
  ],
  usageOverview: {
    Today: {
      aiActionsUsed: 0,
      items: [
        { label: "AI Suggestions", value: "0", percent: 0 },
        { label: "Structure Analysis", value: "0", percent: 0 },
        { label: "Tone & Clarity", value: "0", percent: 0 },
        { label: "Enhancements", value: "0", percent: 0 },
      ],
      rangeLabel: "Today",
      value: "0",
    },
    "This Week": {
      aiActionsUsed: 0,
      items: [
        { label: "AI Suggestions", value: "0", percent: 0 },
        { label: "Structure Analysis", value: "0", percent: 0 },
        { label: "Tone & Clarity", value: "0", percent: 0 },
        { label: "Enhancements", value: "0", percent: 0 },
      ],
      rangeLabel: "This Week",
      value: "0",
    },
    "This Month": {
      aiActionsUsed: 0,
      items: [
        { label: "AI Suggestions", value: "0", percent: 0 },
        { label: "Structure Analysis", value: "0", percent: 0 },
        { label: "Tone & Clarity", value: "0", percent: 0 },
        { label: "Enhancements", value: "0", percent: 0 },
      ],
      rangeLabel: "This Month",
      value: "0",
    },
    "This Year": {
      aiActionsUsed: 0,
      items: [
        { label: "AI Suggestions", value: "0", percent: 0 },
        { label: "Structure Analysis", value: "0", percent: 0 },
        { label: "Tone & Clarity", value: "0", percent: 0 },
        { label: "Enhancements", value: "0", percent: 0 },
      ],
      rangeLabel: "This Year",
      value: "0",
    },
  },
};

const formatCount = new Intl.NumberFormat("en-US");

function getMonthStartIso(): string {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  return monthStart.toISOString();
}

function getTodayStartIso(): string {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return todayStart.toISOString();
}

function getWeekStartIso(): string {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart.toISOString();
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

  if (diffHours < 1) {
    return "Just now";
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeStatus(status: string): DashboardRecentDocument["status"] {
  switch (status.toLowerCase()) {
    case "ready":
      return "Ready";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    case "archived":
      return "Archived";
    case "draft":
    default:
      return "Draft";
  }
}

function normalizeFidelity(
  status: string,
): DashboardRecentDocument["fidelity"] {
  switch (status) {
    case "Structure Preserved":
    case "Original Preserved":
    case "Limited Formatting":
    case "Plain Text Only":
    case "Formatting Review Needed":
      return status;
    default:
      return "Formatting Review Needed";
  }
}

function normalizeFileType(fileType: string): DashboardRecentDocument["type"] {
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

function sourceFolder(sourceType: string): string {
  switch (sourceType) {
    case "upload":
      return "Uploads";
    case "paste":
      return "Pasted Text";
    case "blank":
      return "Blank Documents";
    default:
      return "Documents";
  }
}

function fidelityScore(status: string): number {
  switch (status) {
    case "Structure Preserved":
      return 94;
    case "Original Preserved":
      return 86;
    case "Formatting Review Needed":
      return 78;
    case "Limited Formatting":
      return 68;
    case "Plain Text Only":
      return 58;
    default:
      return 72;
  }
}

function progressPercent(count: number, denominator: number): number {
  if (denominator <= 0 || count <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((count / denominator) * 100));
}

function mapRecentDocument(row: DocumentRow): DashboardRecentDocument {
  return {
    fidelity: normalizeFidelity(row.fidelity_status),
    folder: sourceFolder(row.source_type),
    href: `/documents/${row.id}`,
    id: row.id,
    status: normalizeStatus(row.status),
    title: row.title,
    type: normalizeFileType(row.file_type),
    updated: formatRelativeDate(row.updated_at),
    words: formatCount.format(row.word_count),
  };
}

function mapDocumentTitles(documents: Pick<DocumentRow, "id" | "title">[]) {
  return new Map(documents.map((document) => [document.id, document.title]));
}

function formatActionLabel(value: string): string {
  const labels: Record<string, string> = {
    improvement_scan: "Improvement Scan",
    proofread_correct: "Proofread & Correct",
    improve_readability: "Improve Readability",
    tone_alignment: "Tone Alignment",
    structure_flow: "Structure & Flow",
    summarize_shorten: "Summarize & Shorten",
    translate_document: "Translate Document",
  };

  if (labels[value]) {
    return labels[value];
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function buildActivity(
  documents: DocumentRow[],
  aiRequests: AIRequestRow[],
  versions: VersionRow[],
  exports: ExportRow[],
): DashboardActivityItem[] {
  const titles = mapDocumentTitles(documents);
  const items: Array<DashboardActivityItem & { createdAt: string }> = [];

  for (const row of documents) {
    items.push({
      badge: row.source_type === "upload" ? "Upload Complete" : "Document Ready",
      createdAt: row.created_at,
      description: formatRelativeDate(row.created_at),
      kind: "upload",
      title: `${row.title} created`,
      variant: "success",
    });
  }

  for (const row of aiRequests) {
    const title = titles.get(row.document_id) ?? "Document";
    items.push({
      badge: formatActionLabel(row.action),
      createdAt: row.created_at,
      description: formatRelativeDate(row.created_at),
      kind: "ai",
      title: `AI ${formatActionLabel(row.action).toLowerCase()} generated for ${title}`,
      variant: "ai",
    });
  }

  for (const row of versions) {
    const title = titles.get(row.document_id) ?? row.title;
    items.push({
      badge: "Version Saved",
      createdAt: row.created_at,
      description: formatRelativeDate(row.created_at),
      kind: "version",
      title: `${row.title} saved for ${title}`,
      variant: "info",
    });
  }

  for (const row of exports) {
    const title = titles.get(row.document_id) ?? "Document";
    items.push({
      badge: "Export Ready",
      createdAt: row.created_at,
      description: formatRelativeDate(row.created_at),
      kind: "export",
      title: `${row.format.toUpperCase()} export ready: ${title}`,
      variant: "warning",
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((item) => ({
      badge: item.badge,
      description: item.description,
      kind: item.kind,
      title: item.title,
      variant: item.variant,
    }));
}

function mapSuggestions(
  suggestions: SuggestionRow[],
  titles: Map<string, string>,
): DashboardSuggestionItem[] {
  return suggestions.slice(0, 3).map((suggestion) => {
    const type = suggestion.type.toLowerCase();
    const variant =
      type === "structure" || type === "seo"
        ? "warning"
        : type === "tone"
          ? "info"
          : "ai";

    return {
      documentTitle: titles.get(suggestion.document_id) ?? "Document",
      impact: type === "clarity" || type === "structure" ? "High Impact" : "Medium Impact",
      kind:
        type === "grammar" || type === "seo" || type === "structure" || type === "tone"
          ? type
          : "clarity",
      title: formatActionLabel(type || "suggestion"),
      variant,
    };
  });
}

function buildUsage(
  suggestions: SuggestionRow[],
  aiRequests: AIRequestRow[],
): DashboardUsageItem[] {
  const suggestionCount = suggestions.length;
  const structureCount = aiRequests.filter((request) =>
    ["structure_flow", "improvement_scan", "analyze", "optimize"].includes(
      request.action,
    ),
  ).length;
  const toneCount = aiRequests.filter((request) =>
    [
      "tone_alignment",
      "improve_readability",
      "proofread_correct",
      "tone_analyze",
      "improve_clarity",
      "fix_grammar",
    ].includes(request.action),
  ).length;
  const enhancementCount = aiRequests.filter((request) =>
    [
      "improvement_scan",
      "summarize_shorten",
      "translate_document",
      "optimize",
      "rewrite",
      "simplify_language",
    ].includes(request.action),
  ).length;
  const denominator = Math.max(
    suggestionCount,
    structureCount,
    toneCount,
    enhancementCount,
    1,
  );

  return [
    {
      label: "AI Suggestions",
      value: formatCount.format(suggestionCount),
      percent: progressPercent(suggestionCount, denominator),
    },
    {
      label: "Structure Analysis",
      value: formatCount.format(structureCount),
      percent: progressPercent(structureCount, denominator),
    },
    {
      label: "Tone & Clarity",
      value: formatCount.format(toneCount),
      percent: progressPercent(toneCount, denominator),
    },
    {
      label: "Enhancements",
      value: formatCount.format(enhancementCount),
      percent: progressPercent(enhancementCount, denominator),
    },
  ];
}

function isSince(value: string, sinceIso: string): boolean {
  return new Date(value).getTime() >= new Date(sinceIso).getTime();
}

function buildUsageOverview(
  suggestions: SuggestionRow[],
  aiRequests: AIRequestRow[],
): Record<DashboardUsageRange, DashboardUsageOverview> {
  const starts: Record<DashboardUsageRange, string> = {
    Today: getTodayStartIso(),
    "This Week": getWeekStartIso(),
    "This Month": getMonthStartIso(),
    "This Year": getYearStartIso(),
  };

  return Object.fromEntries(
    (Object.keys(starts) as DashboardUsageRange[]).map((range) => {
      const rangeSuggestions = suggestions.filter((row) =>
        isSince(row.created_at, starts[range]),
      );
      const rangeAIRequests = aiRequests.filter((row) =>
        isSince(row.created_at, starts[range]),
      );

      return [
        range,
        {
          aiActionsUsed: rangeAIRequests.length,
          items: buildUsage(rangeSuggestions, rangeAIRequests),
          rangeLabel: range,
          value: formatCount.format(rangeAIRequests.length),
        },
      ];
    }),
  ) as Record<DashboardUsageRange, DashboardUsageOverview>;
}

function buildExportFormats(exports: ExportRow[]): DashboardExportFormat[] {
  const counts = new Map<DashboardExportFormat["format"], number>([
    ["PDF", 0],
    ["DOCX", 0],
    ["TXT", 0],
    ["MD", 0],
    ["Other", 0],
  ]);

  for (const row of exports) {
    const format = row.format.toLowerCase();
    const key =
      format === "pdf"
        ? "PDF"
        : format === "docx"
          ? "DOCX"
          : format === "txt"
            ? "TXT"
            : format === "markdown" || format === "md"
              ? "MD"
              : "Other";

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = exports.length;
  const toneByFormat: Record<DashboardExportFormat["format"], DashboardExportFormat["tone"]> = {
    PDF: "accent",
    DOCX: "info",
    TXT: "success",
    MD: "warning",
    Other: "muted",
  };

  return Array.from(counts.entries()).map(([format, count]) => ({
    count,
    format,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    tone: toneByFormat[format],
  }));
}

async function safeCount(
  table:
    | "ai_requests"
    | "documents"
    | "exports"
    | "suggestions"
    | "usage_ledger",
  userId: string,
  sinceIso?: string,
): Promise<number> {
  const supabase = createSupabaseServerClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to count ${table}`);
  }

  return count ?? 0;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createSupabaseServerClient();
  const monthStartIso = getMonthStartIso();

  const [
    totalDocuments,
    documentsThisMonth,
    aiActionsThisMonth,
    totalExports,
    exportsThisMonth,
  ] = await Promise.all([
    safeCount("documents", userId),
    safeCount("documents", userId, monthStartIso),
    safeCount("ai_requests", userId, monthStartIso),
    safeCount("exports", userId),
    safeCount("exports", userId, monthStartIso),
  ]);

  const { data: recentDocumentsData, error: recentDocumentsError } = await supabase
    .from("documents")
    .select("id,title,status,source_type,file_type,fidelity_status,word_count,created_at,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(4);

  if (recentDocumentsError) {
    throw new Error("Failed to load recent documents");
  }

  const recentDocumentRows = (recentDocumentsData ?? []) as DocumentRow[];

  const [{ data: aiData, error: aiError }, { data: versionData, error: versionError }, { data: exportData, error: exportError }, { data: suggestionData, error: suggestionError }] =
    await Promise.all([
      supabase
        .from("ai_requests")
        .select("document_id,action,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .gte("created_at", getYearStartIso())
        .limit(500),
      supabase
        .from("document_versions")
        .select("document_id,title,source,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("exports")
        .select("document_id,format,status,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("suggestions")
        .select("id,document_id,type,status,created_at")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .gte("created_at", getYearStartIso())
        .limit(500),
    ]);

  if (aiError || versionError || exportError || suggestionError) {
    throw new Error("Failed to load dashboard activity");
  }

  const aiRows = (aiData ?? []) as AIRequestRow[];
  const versionRows = (versionData ?? []) as VersionRow[];
  const exportRows = (exportData ?? []) as ExportRow[];
  const suggestionRows = (suggestionData ?? []) as SuggestionRow[];

  const activityDocumentIds = new Set<string>();
  for (const row of recentDocumentRows) activityDocumentIds.add(row.id);
  for (const row of aiRows) activityDocumentIds.add(row.document_id);
  for (const row of versionRows) activityDocumentIds.add(row.document_id);
  for (const row of exportRows) activityDocumentIds.add(row.document_id);
  for (const row of suggestionRows) activityDocumentIds.add(row.document_id);

  let titleRows: Pick<DocumentRow, "id" | "title">[] = recentDocumentRows;

  if (activityDocumentIds.size > 0) {
    const { data: documentsForTitles, error: titleError } = await supabase
      .from("documents")
      .select("id,title")
      .eq("user_id", userId)
      .in("id", Array.from(activityDocumentIds));

    if (titleError) {
      throw new Error("Failed to load dashboard document titles");
    }

    titleRows = (documentsForTitles ?? []) as Pick<DocumentRow, "id" | "title">[];
  }

  const titleMap = mapDocumentTitles(titleRows);
  const avgQualityScore =
    recentDocumentRows.length > 0
      ? Math.round(
          recentDocumentRows.reduce(
            (sum, document) => sum + fidelityScore(document.fidelity_status),
            0,
          ) / recentDocumentRows.length,
        )
      : 0;

  return {
    activity: buildActivity(recentDocumentRows, aiRows, versionRows, exportRows),
    exportFormats: buildExportFormats(exportRows),
    metrics: {
      aiActionsThisMonth,
      aiActionsUsed: aiRows.length,
      avgQualityScore,
      documentsThisMonth,
      exportsThisMonth,
      totalDocuments,
      totalExports,
    },
    recentDocuments: recentDocumentRows.map(mapRecentDocument),
    suggestions: mapSuggestions(suggestionRows, titleMap),
    usage: buildUsage(suggestionRows, aiRows),
    usageOverview: buildUsageOverview(suggestionRows, aiRows),
  };
}

export function getEmptyDashboardData(): DashboardData {
  return emptyDashboardData;
}
