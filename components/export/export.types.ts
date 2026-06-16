import type { LucideIcon } from "lucide-react";

export type ExportFormat = "docx" | "pdf" | "markdown" | "txt" | "html";

export type ExportStatus = "idle" | "processing" | "ready" | "error";

export type ExportFormatOption = {
  id: ExportFormat;
  label: string;
  extension: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
};

export type ExportOptionKey =
  | "includeAiImprovements"
  | "includeTrackChanges"
  | "addSummary"
  | "addMetadata";

export type ExportOptionsState = Record<ExportOptionKey, boolean> & {
  imageQuality: string;
  pageSize: string;
  margins: string;
  watermark: string;
};

export type ExportResult = {
  id: string;
  format: ExportFormat;
  fileName: string;
  fileKey: string;
  signedUrl: string;
  downloadUrl: string;
  expiresAt: string;
  warning: string | null;
};
