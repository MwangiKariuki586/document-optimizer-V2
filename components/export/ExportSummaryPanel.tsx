import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  XCircle,
} from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";
import type {
  ExportFormat,
  ExportFormatOption,
  ExportOptionsState,
  ExportResult,
  ExportStatus,
} from "@/components/export/export.types";
import type { AppliedSuggestionSummary } from "@/lib/suggestions/suggestions.types";

type ExportSummaryPanelProps = {
  documentTitle: string;
  versionNumber: number;
  wordCount: number;
  estimatedPages: number;
  estimatedFileSize: string;
  selectedFormat: ExportFormat;
  formats: ExportFormatOption[];
  options: ExportOptionsState;
  status: ExportStatus;
  result: ExportResult | null;
  errorMessage: string | null;
  improvementSummary: AppliedSuggestionSummary;
  onGenerate: () => void;
  onDownload: (result: ExportResult) => void;
  showFooterAction?: boolean;
};

type SummaryToggleOption = {
  key: keyof Pick<
    ExportOptionsState,
    | "includeAiImprovements"
    | "includeTrackChanges"
    | "addSummary"
    | "addMetadata"
  >;
  label: string;
};

const optionLabels: SummaryToggleOption[] = [
  { key: "includeAiImprovements", label: "AI improvements included" },
  { key: "includeTrackChanges", label: "Track changes included" },
  { key: "addSummary", label: "AI summary included" },
  { key: "addMetadata", label: "Metadata included" },
];

export function ExportSummaryPanel({
  documentTitle,
  versionNumber,
  wordCount,
  estimatedPages,
  estimatedFileSize,
  selectedFormat,
  formats,
  options,
  status,
  result,
  errorMessage,
  improvementSummary,
  onGenerate,
  onDownload,
  showFooterAction = true,
}: ExportSummaryPanelProps) {
  const selected =
    formats.find((format) => format.id === selectedFormat) ?? formats[0];
  const SelectedIcon = selected.icon;

  return (
    <aside className="flex min-h-0 flex-col h-full overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <h2 className="text-sm font-semibold text-text-primary">
          Export Summary
        </h2>

        <div className="mt-5 flex items-start gap-3 border-b border-border-light pb-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-muted text-info-foreground">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">
              {documentTitle}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Version {versionNumber} (Current)
            </p>
          </div>
        </div>

        <div className="border-b border-border-light py-5">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            Export Format
          </h3>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selected.iconClassName}`}
            >
              <SelectedIcon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {selected.label}
              </p>
              <p className="text-xs text-text-muted">{selected.extension}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-border-light py-5">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            Document Stats
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">Words</dt>
              <dd className="font-semibold text-text-primary">
                {wordCount.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">Pages (estimated)</dt>
              <dd className="font-semibold text-text-primary">
                {estimatedPages}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-text-secondary">File size</dt>
              <dd className="font-semibold text-text-primary">
                {estimatedFileSize}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 rounded-xl border border-accent-light bg-accent-muted p-4">
          <p className="text-sm font-semibold text-accent">
            AI Improvements Applied
          </p>

          {improvementSummary.items.length > 0 ? (
            <div className="mt-4 space-y-2 text-xs text-text-secondary">
              {improvementSummary.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <span className="font-semibold text-text-primary">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-text-secondary">
              No applied AI suggestions yet.
            </p>
          )}
        </div>
        <div className="border-b border-border-light py-5">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            Options
          </h3>
          <div className="mt-3 space-y-2">
            {optionLabels.map((option) => {
              const included = options[option.key];

              return (
                <div
                  key={option.key}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  {included ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="size-4 shrink-0 text-text-muted" />
                  )}
                  <span>{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {status === "error" ? (
          <div className="mt-4 flex gap-3 rounded-xl bg-error-muted p-3 text-error-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Export failed</p>
              <p className="mt-1 text-xs">
                {errorMessage ?? "Could not generate the export. Try again."}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {showFooterAction ? (
        <div className="shrink-0 p-4">
          {status === "ready" && result ? (
            <button
              type="button"
              onClick={() => onDownload(result)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            >
              <Download className="size-4" />
              Download Again
            </button>
          ) : (
            <LoadingButton
              className="w-full"
              isLoading={status === "processing"}
              loadingText="Exporting"
              disabled={status === "processing"}
              onClick={onGenerate}
            >
              Export
            </LoadingButton>
          )}
        </div>
      ) : null}
    </aside>
  );
}
