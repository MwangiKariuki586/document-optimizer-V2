import { AlertTriangle, CheckCircle, FileText, Sparkles } from "lucide-react";
import { StatCardGrid } from "@/components/workspace/StatCardGrid";
import type { DocumentsLibrarySummary } from "@/lib/documents/documents-library.service";

type DocumentsSummaryCardsProps = {
  summary: DocumentsLibrarySummary;
};

export function DocumentsSummaryCards({ summary }: DocumentsSummaryCardsProps) {
  const stats = [
    {
      label: "Total Documents",
      meta: "Library",
      value: summary.total.toLocaleString("en-US"),
      helper: "Active documents",
      action: "View all documents",
      icon: FileText,
      tone: "info" as const,
    },
    {
      label: "Ready",
      meta: "Status",
      value: summary.ready.toLocaleString("en-US"),
      helper: "Available for export",
      action: "View export items",
      icon: CheckCircle,
      tone: "success" as const,
    },
    {
      label: "Suggestions Pending",
      meta: "Status",
      value: summary.suggestionsPending.toLocaleString("en-US"),
      helper: "Documents with AI suggestions",
      action: "Review suggestions",
      icon: Sparkles,
      tone: "ai" as const,
    },
    {
      label: "Formatting Review",
      meta: "Status",
      value: summary.formattingReview.toLocaleString("en-US"),
      helper: "Need formatting attention",
      action: "Open review queue",
      icon: AlertTriangle,
      tone: "accent" as const,
    },
  ];

  return <StatCardGrid stats={stats} />;
}
