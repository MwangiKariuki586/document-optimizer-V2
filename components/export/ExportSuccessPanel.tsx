import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Sparkle,
  Tag,
} from "lucide-react";

import type {
  ExportFormat,
  ExportFormatOption,
  ExportOptionsState,
  ExportResult,
} from "@/components/export/export.types";

type ExportSuccessPanelProps = {
  documentId: string;
  documentTitle: string;
  selectedFormat: ExportFormat;
  formats: ExportFormatOption[];
  options: ExportOptionsState;
  result: ExportResult;
  estimatedFileSize: string;
  completedAt: string;
  onDownload: (result: ExportResult) => void;
  onExportAnother: () => void;
};

type IncludedOption = {
  key: keyof Pick<
    ExportOptionsState,
    | "includeAiImprovements"
    | "includeTrackChanges"
    | "addSummary"
    | "addMetadata"
  >;
  label: string;
};

const includedOptions: IncludedOption[] = [
  { key: "includeAiImprovements", label: "AI improvements included" },
  { key: "includeTrackChanges", label: "Track changes included" },
  { key: "addSummary", label: "AI summary included" },
  { key: "addMetadata", label: "Metadata included" },
];

function formatCompletedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ExportSuccessPanel({
  documentId,
  documentTitle,
  selectedFormat,
  formats,
  options,
  result,
  estimatedFileSize,
  completedAt,
  onDownload,
  onExportAnother,
}: ExportSuccessPanelProps) {
  const selected =
    formats.find((format) => format.id === selectedFormat) ?? formats[0];
  const SelectedIcon = selected.icon;

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
      <div className="h-full min-h-0 overflow-y-auto p-5 md:p-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="relative flex size-32 items-center justify-center md:size-36">
          <Sparkle className="absolute left-2 top-9 size-3 text-success" />
          <Sparkle className="absolute left-9 bottom-3 size-3 text-accent" />
          <Sparkle className="absolute right-7 top-3 size-3.5 text-accent" />
          <Sparkle className="absolute right-8 bottom-5 size-3 text-success" />
          <Sparkle className="absolute left-0 top-1/2 size-2.5 text-accent" />
          <Sparkle className="absolute right-0 top-1/2 size-2.5 text-success" />
          <div className="relative flex size-20 items-center justify-center rounded-full border border-success-light bg-success-muted text-success-foreground shadow-card md:size-24">
            <Check className="size-9 md:size-10" />
          </div>
        </div>

        <span className="mt-4 rounded-full bg-success-muted px-3 py-1 text-xs font-semibold uppercase tracking-normal text-success-foreground">
          Export successful
        </span>
        <h2 className="mt-3 text-[28px] font-bold leading-9 text-text-primary md:text-[34px] md:leading-[42px]">
          Your file is ready
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Your download has started. You can download it again or continue
          working on your document.
        </p>
      </div>

        <div className="mx-auto mt-5 max-w-4xl">
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <Pencil className="size-4" />
            Back to Editor
          </Link>
          <button
            type="button"
            onClick={() => onDownload(result)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark"
          >
            <Download className="size-4" />
            Download again
          </button>
          <button
            type="button"
            onClick={onExportAnother}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <RefreshCw className="size-4" />
            Export Another Format
          </button>
        </div>
      </div>

        <div className="mx-auto mt-5 max-w-4xl rounded-xl border border-border bg-surface p-4 md:p-5">
        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex flex-col items-center justify-center rounded-xl bg-surface-secondary p-5 text-center">
            <span
              className={`flex size-16 items-center justify-center rounded-xl ${selected.iconClassName}`}
            >
              <SelectedIcon className="size-8" />
            </span>
            <span className="mt-4 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold uppercase tracking-normal text-accent">
              {selected.extension}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">
              Export Details
            </h3>
            <dl className="mt-4 divide-y divide-border-light text-sm">
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <FileText className="size-4" />
                  File name
                </dt>
                <dd className="min-w-0 truncate font-semibold text-text-primary">
                  {result.fileName}
                </dd>
              </div>
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <FileCheck2 className="size-4" />
                  Export format
                </dt>
                <dd>
                  <span className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent">
                    {selected.label} ({selected.extension})
                  </span>
                </dd>
              </div>
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <Calendar className="size-4" />
                  Exported on
                </dt>
                <dd className="font-semibold text-text-primary">
                  {formatCompletedAt(completedAt)}
                </dd>
              </div>
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <Download className="size-4" />
                  File size
                </dt>
                <dd className="font-semibold text-text-primary">
                  {estimatedFileSize}
                </dd>
              </div>
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <FileText className="size-4" />
                  Source document
                </dt>
                <dd className="min-w-0 truncate font-semibold text-text-primary">
                  {documentTitle}
                </dd>
              </div>
              <div className="grid gap-2 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
                <dt className="flex items-center gap-2 font-medium text-text-secondary">
                  <Tag className="size-4" />
                  Export ID
                </dt>
                <dd className="min-w-0 truncate font-semibold text-text-primary">
                  {result.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-5 grid gap-2 border-t border-border-light pt-5 md:grid-cols-2">
          {includedOptions.map((option) => {
            const isIncluded = options[option.key];

            return (
              <div
                key={option.key}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <CheckCircle2
                  className={`size-4 shrink-0 ${
                    isIncluded ? "text-success" : "text-text-muted"
                  }`}
                />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      </div>

        <div className="mx-auto max-w-4xl">
        <div className="mt-5 flex gap-3 rounded-xl border border-accent-light bg-accent-muted p-4 text-accent">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm leading-6">
            Exports are stored privately and can be regenerated anytime from the
            export workspace.
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
