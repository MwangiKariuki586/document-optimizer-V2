"use client";

import { useMemo, useState } from "react";
import {
  FileCode2,
  FileText,
  FileType,
  FileWarning,
  Settings2,
} from "lucide-react";

import { ExportFormatCard } from "@/components/export/ExportFormatCard";
import { ExportOptionsPanel } from "@/components/export/ExportOptionsPanel";
import { ExportSummaryPanel } from "@/components/export/ExportSummaryPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import type {
  ExportFormat,
  ExportFormatOption,
  ExportOptionKey,
  ExportOptionsState,
  ExportResult,
  ExportStatus,
} from "@/components/export/export.types";
import type { EditorDocument } from "@/lib/documents/document.types";
import { appToast } from "@/lib/feedback/toast";

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

function downloadExport(result: ExportResult) {
  const link = window.document.createElement("a");
  link.href = result.downloadUrl;
  link.download = result.fileName;
  link.rel = "noopener";
  window.document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ExportWorkspace({ document }: ExportWorkspaceProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("docx");
  const [options, setOptions] = useState<ExportOptionsState>(defaultOptions);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [result, setResult] = useState<ExportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const estimatedPages = Math.max(1, Math.ceil(document.wordCount / 350));
  const estimatedFileSize = useMemo(
    () => estimateFileSize(document.wordCount, selectedFormat),
    [document.wordCount, selectedFormat],
  );

  const toggleOption = (key: ExportOptionKey) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const selectOption = (
    key: "imageQuality" | "pageSize" | "margins" | "watermark",
    value: string,
  ) => {
    setOptions((current) => ({ ...current, [key]: value }));
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
  };

  const handleGenerateExport = async () => {
    if (status === "processing") {
      return;
    }

    setStatus("processing");
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch(`/api/documents/${document.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: selectedFormat, options }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: ExportResult;
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? "Could not generate the export.");
      }

      setResult(payload.data);
      setStatus("ready");
      downloadExport(payload.data);
      appToast.success("Export started.");

      if (payload.data.warning) {
        appToast.warning(payload.data.warning);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate the export.";
      setErrorMessage(message);
      setStatus("error");
      appToast.error(message);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-3 xl:h-full xl:overflow-hidden">
        <div className="rounded-xl bg-transparent px-0 py-0">
          <PageHeader
            eyebrow="Export workspace"
            title="Export Document"
            description="Choose how you want to export your optimized document."
          />
        </div>

        <div className="grid min-h-0 gap-3 overflow-hidden xl:h-full xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[auto_minmax(0,1fr)]">
          <div className="xl:col-span-2">
            <h2 className="text-sm font-semibold text-text-primary">
              1. Choose Export Format
            </h2>
          </div>

          <section className="min-h-0 overflow-y-auto rounded-xl">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {exportFormats.map((format) => (
                <ExportFormatCard
                  key={format.id}
                  format={format}
                  selectedFormat={selectedFormat}
                  onSelect={handleFormatSelect}
                />
              ))}
            </div>

            <div className="mt-6">
              <ExportOptionsPanel
                options={options}
                onToggle={toggleOption}
                onSelect={selectOption}
              />
            </div>

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

          <div className="flex min-h-0 flex-col xl:h-full">
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
              result={result}
              errorMessage={errorMessage}
              onGenerate={handleGenerateExport}
              onDownload={downloadExport}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
