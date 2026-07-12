import { auth } from "@clerk/nextjs/server";
import {
  ClipboardList,
  Download,
  FileText,
  FileUp,
  Star,
  WandSparkles,
} from "lucide-react";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DocumentStats } from "@/components/dashboard/DocumentStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RecentDocuments } from "@/components/dashboard/RecentDocuments";
import { SuggestionsReady } from "@/components/dashboard/SuggestionsReady";
import { UsageSummary } from "@/components/dashboard/UsageSummary";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { getCachedDashboardData } from "@/lib/cache/workspace-cache";
import {
  getEmptyDashboardData,
  type DashboardData,
} from "@/lib/dashboard/dashboard.service";
import { newDocumentHref } from "@/lib/documents/new-document.routes";

export const unstable_dynamicStaleTime = 60;

const quickActions = [
  {
    title: "Upload Document",
    description: "Upload a file from your device",
    href: newDocumentHref("upload"),
    icon: FileUp,
  },
  {
    title: "Paste Text",
    description: "Paste text to optimize instantly",
    href: newDocumentHref("paste"),
    icon: ClipboardList,
  },
];

const aiActionLimit = 1000;

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
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

function qualityLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score > 0) return "Needs Review";
  return "No score yet";
}

async function loadDashboardData(userId: string): Promise<{
  data: DashboardData;
  error: string | null;
}> {
  try {
    return {
      data: await getCachedDashboardData(userId),
      error: null,
    };
  } catch (error) {
    console.error("[dashboard/load]", error);

    return {
      data: getEmptyDashboardData(),
      error:
        "We could not load dashboard data. Check the Supabase server configuration and try again.",
    };
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const { data: dashboardData, error } = userId
    ? await loadDashboardData(userId)
    : { data: getEmptyDashboardData(), error: null };

  const stats = [
    {
      label: "Total Documents",
      meta: "Library",
      value: formatNumber(dashboardData.metrics.totalDocuments),
      helper: "Across your workspace",
      action: `${formatNumber(dashboardData.metrics.documentsThisMonth)} this month`,
      icon: FileText,
      tone: "info" as const,
    },
    {
      label: "AI Actions This Month",
      meta: "Usage",
      value: `${formatNumber(dashboardData.metrics.aiActionsThisMonth)} / ${formatNumber(aiActionLimit)}`,
      helper: "Monthly action allowance",
      icon: WandSparkles,
      progressClass: progressClass(
        dashboardData.metrics.aiActionsThisMonth,
        aiActionLimit,
      ),
      tone: "accent" as const,
    },
    {
      label: "Exports",
      meta: "Output",
      value: formatNumber(dashboardData.metrics.totalExports),
      helper: "Completed exports",
      action: `+${formatNumber(dashboardData.metrics.exportsThisMonth)} this month`,
      icon: Download,
      tone: "success" as const,
    },
    {
      label: "Avg. Quality Score",
      meta: "Quality",
      value: formatNumber(dashboardData.metrics.avgQualityScore),
      helper: "Document quality average",
      action: qualityLabel(dashboardData.metrics.avgQualityScore),
      icon: Star,
      tone: "ai" as const,
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Dashboard Workspace"
        description="Optimize documents with AI while tracking formatting confidence, document activity, and usage."
      />

      {error ? (
        <InlineAlert title="Dashboard data unavailable" variant="warning">
          {error}
        </InlineAlert>
      ) : null}

      <section className="grid min-w-0 items-start gap-6 xl:grid-cols-12">
        <main className="min-w-0 space-y-6 xl:col-span-8">
          <DashboardQuickActions actions={quickActions} />
          <DocumentStats stats={stats} />
          <RecentDocuments documents={dashboardData.recentDocuments} />

          <div className="grid min-w-0 items-stretch gap-6 lg:grid-cols-2">
            <SuggestionsReady suggestions={dashboardData.suggestions} />
            <RecentActivity activity={dashboardData.activity} />
          </div>
        </main>

        <UsageSummary
          className="xl:col-span-4"
          aiActionLimit={aiActionLimit}
          exportFormats={dashboardData.exportFormats}
          usageOverview={dashboardData.usageOverview}
        />
      </section>
    </PageShell>
  );
}
