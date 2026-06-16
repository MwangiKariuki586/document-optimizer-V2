"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Eye,
  FileCode2,
  FileText,
  FileType,
  FileWarning,
  Lock,
  Settings2,
} from "lucide-react";

import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { ExportFormatCard } from "@/components/export/ExportFormatCard";
import { ExportOptionsPanel } from "@/components/export/ExportOptionsPanel";
import { ExportSummaryPanel } from "@/components/export/ExportSummaryPanel";
import type {
  ExportFormat,
  ExportFormatOption,
  ExportOptionKey,
  ExportOptionsState,
  ExportStatus,
} from "@/components/export/export.types";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import type { EditorDocument } from "@/lib/documents/document.types";

type ExportWorkspaceProps = {
  document: EditorDocument;
};

const exportFormats: ExportFormatOption[] = [
  {
    id: "docx",
    label: "Word Document",
    extension: ".docx",
    description: "Editable Word document with tracked changes applied.",
    icon: FileText,
    iconClassName: "bg-info-muted text-info-foreground",
  },
  {
    id: "pdf",
    label: "PDF Document",
    extension: ".pdf",
    description: "Fixed format PDF for sharing and printing.",
    icon: FileWarning,
    iconClassName: "bg-error-muted text-error-foreground",
  },
  {
    id: "markdown",
    label: "Markdown",
    extension: ".md",
    description: "Markdown format for developers and documentation.",
    icon: FileCode2,
    iconClassName: "bg-surface-tertiary text-text-secondary",
  },
  {
    id: "txt",
    label: "Plain Text",
    extension: ".txt",
    description: "Simple text file with no formatting.",
    icon: FileType,
    iconClassName: "bg-surface-secondary text-text-secondary",
  },
  {
    id: "html",
    label: "HTML",
    extension: ".html",
    description: "Web-ready HTML document.",
    icon: FileCode2,
    iconClassName: "bg-ai-muted text-ai-dark",
  },
];

const defaultOptions: ExportOptionsState = {
  includeAiImprovements: true,
  includeTrackChanges: true,
  addSummary: true,
  addMetadata: false,
  imageQuality: "High (300 DPI)",
  pageSize: "A4 (210 x 297 mm)",
  margins: "Standard (1 inch)",
  watermark: "None",
};

const steps = [
  { label: "Format", helper: "Choose file format" },
  { label: "Options", helper: "Set preferences" },
  { label: "Review", helper: "Review export" },
  { label: "Export", helper: "Download file" },
];

function estimateFileSize(wordCount: number, format: ExportFormat) {
  const multiplier: Record<ExportFormat, number> = {
    docx: 0.42,
    pdf: 0.64,
    markdown: 0.18,
    txt: 0.12,
    html: 0.28,
  };
  const estimatedKb = Math.max(24, Math.round(wordCount * multiplier[format]));
  return `${estimatedKb.toLocaleString()} KB`;
}

export function ExportWorkspace({ document }: ExportWorkspaceProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("docx");
  const [options, setOptions] = useState<ExportOptionsState>(defaultOptions);
  const [status, setStatus] = useState<ExportStatus>("idle");

  const estimatedPages = Math.max(1, Math.ceil(document.wordCount / 350));
  const estimatedFileSize = useMemo(
    () => estimateFileSize(document.wordCount, selectedFormat),
    [document.wordCount, selectedFormat],
  );

  useEffect(() => {
    if (status !== "processing") {
      return;
    }

    const timer = window.setTimeout(() => setStatus("ready"), 900);
    return () => window.clearTimeout(timer);
  }, [status]);

  const toggleOption = (key: ExportOptionKey) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    setStatus("idle");
  };

  const selectOption = (
    key: "imageQuality" | "pageSize" | "margins" | "watermark",
    value: string,
  ) => {
    setOptions((current) => ({ ...current, [key]: value }));
    setStatus("idle");
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    setStatus("idle");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:max-h-[calc(100vh-73px)] xl:overflow-hidden">
      <div
        className={`mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden ${
          sidebarCollapsed
            ? "lg:grid-cols-[64px_minmax(0,1fr)]"
            : "lg:grid-cols-[224px_minmax(0,1fr)]"
        }`}
      >
        <div className="order-2 min-h-0 lg:order-1 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden">
          <EditorSidebar
            documentId={document.id}
            fileName={document.title}
            fileType={document.fileType}
            saveState="saved"
            activeNav="export"
            suggestionCount={0}
            versionCount={document.versionNumber}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            aiUsage={{
              used: 7200,
              total: 10000,
              resetLabel: "Reset in 18 days",
            }}
            user={{ name: "Alex Johnson", email: "alex@example.com" }}
          />
        </div>

        <div className="order-1 grid min-h-0 gap-3 overflow-hidden lg:order-2 xl:h-full xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-h-0 overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-card-soft">
            <div className="flex flex-col gap-4 border-b border-border-light pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                  Export workspace
                </p>
                <h1 className="mt-1 text-[28px] font-bold leading-9 text-text-primary md:text-[32px] md:leading-10">
                  Export Document
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Choose how you want to export your optimized document.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
                <Lock className="size-3.5 text-accent" />
                Private export
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {steps.map((step, index) => {
                const isComplete = index === 0;
                const isActive = index === 1;

                return (
                  <div key={step.label} className="relative min-w-0">
                    {index > 0 ? (
                      <span className="absolute -left-1/2 top-4 hidden h-px w-full bg-border md:block" />
                    ) : null}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span
                        className={`flex size-8 items-center justify-center rounded-full border text-xs font-semibold ${
                          isComplete
                            ? "border-accent bg-accent text-accent-foreground"
                            : isActive
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border-strong bg-surface text-text-muted"
                        }`}
                      >
                        {isComplete ? <Check className="size-4" /> : index + 1}
                      </span>
                      <span className="mt-2 text-sm font-semibold text-text-primary">
                        {step.label}
                      </span>
                      <span className="mt-0.5 text-xs text-text-muted">
                        {step.helper}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="mt-6">
              <h2 className="text-sm font-semibold text-text-primary">
                1. Choose Export Format
              </h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {exportFormats.map((format) => (
                  <ExportFormatCard
                    key={format.id}
                    format={format}
                    selectedFormat={selectedFormat}
                    onSelect={handleFormatSelect}
                  />
                ))}
              </div>
            </section>

            <div className="mt-6">
              <ExportOptionsPanel
                options={options}
                onToggle={toggleOption}
                onSelect={selectOption}
              />
            </div>

            <section className="mt-6 rounded-xl border border-border bg-surface p-4 shadow-card-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
                    {status === "processing" ? (
                      <CometSpinner className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-text-primary">
                      Preview
                    </h2>
                    <p className="mt-1 text-xs text-text-secondary">
                      {status === "ready"
                        ? "Your mock export is ready for review and download."
                        : status === "processing"
                          ? "Preparing a secure export preview with your selected settings."
                          : "See how your document will look in the selected format."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus("ready")}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light"
                >
                  <Download className="size-4" />
                  Preview Document
                </button>
              </div>
            </section>

            <section className="mt-6 rounded-xl border border-warning-light bg-warning-muted p-4 text-warning-foreground">
              <div className="flex gap-3">
                <Settings2 className="mt-0.5 size-4 shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold">
                    Formatting review recommended
                  </h2>
                  <p className="mt-1 text-xs leading-5">
                    PDF and Word exports may differ slightly from the editable
                    workspace. Your original uploaded file remains preserved.
                  </p>
                </div>
              </div>
            </section>
          </section>

          <ExportSummaryPanel
            documentTitle={document.title}
            versionNumber={document.versionNumber}
            wordCount={document.wordCount}
            estimatedPages={estimatedPages}
            estimatedFileSize={estimatedFileSize}
            selectedFormat={selectedFormat}
            formats={exportFormats}
            options={options}
            status={status}
            onGenerate={() => setStatus("processing")}
            onShowError={() => setStatus("error")}
            onResetStatus={() => setStatus("idle")}
          />
        </div>
      </div>
    </main>
  );
}
