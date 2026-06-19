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
      value: summary.total.toLocaleString("en-US"),
      helper: "Active documents",
      icon: FileText,
      tone: "info" as const,
    },
    {
      label: "Ready",
      value: summary.ready.toLocaleString("en-US"),
      helper: "Available for export",
      icon: CheckCircle,
      tone: "success" as const,
    },
    {
      label: "Suggestions Pending",
      value: summary.suggestionsPending.toLocaleString("en-US"),
      helper: "Documents with AI suggestions",
      icon: Sparkles,
      tone: "ai" as const,
    },
    {
      label: "Formatting Review",
      value: summary.formattingReview.toLocaleString("en-US"),
      helper: "Need formatting attention",
      icon: AlertTriangle,
      tone: "accent" as const,
    },
  ];

  return <StatCardGrid stats={stats} />;
}
