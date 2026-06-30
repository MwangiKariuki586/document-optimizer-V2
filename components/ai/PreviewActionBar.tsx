"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, FileDown, RotateCcw, Save, Undo2 } from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";
import { appToast } from "@/lib/feedback/toast";

type ResultMode = "optimization" | "summary" | "translation";

type PreviewActionBarProps = {
  documentId: string;
  requestId?: string;
  resultMode?: ResultMode;
  proposedMarkdown?: string;
};

type SaveCopyResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    title: string;
  };
};

type SaveVersionResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    versionNumber: number;
  };
};

function getResultModeLabel(resultMode?: ResultMode): string {
  if (resultMode === "summary") {
    return "summary";
  }

  if (resultMode === "translation") {
    return "translation";
  }

  return "AI result";
}

export function PreviewActionBar({
  documentId,
  requestId,
  resultMode = "optimization",
  proposedMarkdown = "",
}: PreviewActionBarProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<
    "apply" | "save-version" | "save-copy" | null
  >(null);
  const isBusy = Boolean(busyAction);

  const handleCopy = async () => {
    if (!proposedMarkdown.trim()) {
      appToast.error("There is no result to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(proposedMarkdown);
      appToast.success("Result copied.");
    } catch {
      appToast.error("Could not copy the result.");
    }
  };

  const handleApply = async () => {
    if (!requestId || isBusy) {
      return;
    }

    setBusyAction("apply");

    try {
      const response = await fetch(
        `/api/documents/${documentId}/ai/${requestId}/apply`,
        { method: "POST" },
      );
      const data: SaveVersionResponse = await response.json();

      if (!response.ok || !data.success) {
        appToast.error(data.error ?? "Could not apply AI result.");
        return;
      }

      appToast.success("AI result applied. A version snapshot was created first.");
      router.push(`/documents/${documentId}`);
      router.refresh();
    } catch {
      appToast.error("Could not apply AI result. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveVersion = async () => {
    if (!requestId || isBusy) {
      return;
    }

    setBusyAction("save-version");

    try {
      const response = await fetch(
        `/api/documents/${documentId}/ai/${requestId}/save-version`,
        { method: "POST" },
      );
      const data: SaveVersionResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        appToast.error(data.error ?? "Could not save this result as a version.");
        return;
      }

      appToast.success(`Saved as version v${data.data.versionNumber}.`);
    } catch {
      appToast.error("Could not save this result as a version.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveCopy = async () => {
    if (!requestId || isBusy) {
      return;
    }

    setBusyAction("save-copy");

    try {
      const response = await fetch(
        `/api/documents/${documentId}/ai/${requestId}/save-copy`,
        { method: "POST" },
      );
      const data: SaveCopyResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        appToast.error(data.error ?? "Could not save this result as a new document.");
        return;
      }

      appToast.success("Saved as a new document.");
      router.push(`/documents/${data.data.documentId}`);
      router.refresh();
    } catch {
      appToast.error("Could not save this result as a new document.");
    } finally {
      setBusyAction(null);
    }
  };

  const copyLabel =
    resultMode === "translation" ? "Copy Translation" : "Copy Result";
  const saveCopyLabel =
    resultMode === "translation"
      ? "Save Translated Copy"
      : resultMode === "summary"
        ? "Save as New Document"
        : "Save as New Document";

  return (
    <footer className="flex shrink-0 flex-col gap-2 rounded-xl px-4 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <Link
          href={`/documents/${documentId}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-1.5 text-sm font-medium text-accent transition hover:bg-surface-secondary"
        >
          <Undo2 className="size-4" />
          Return to Editor
        </Link>

        {resultMode === "optimization" && requestId ? (
          <LoadingButton
            onClick={handleApply}
            disabled={isBusy}
            isLoading={busyAction === "apply"}
            loadingText="Applying..."
            className="min-h-9 px-4 py-1.5 text-sm"
          >
            <Check className="size-4" />
            Apply to Document
          </LoadingButton>
        ) : null}

        {resultMode === "summary" || resultMode === "translation" ? (
          <button
            type="button"
            onClick={handleCopy}
            disabled={isBusy}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Copy className="size-4" />
            {copyLabel}
          </button>
        ) : null}

        {requestId && (resultMode === "summary" || resultMode === "translation") ? (
          <LoadingButton
            onClick={handleSaveCopy}
            disabled={isBusy}
            isLoading={busyAction === "save-copy"}
            loadingText="Saving..."
            className="min-h-9 px-4 py-1.5 text-sm"
          >
            <Save className="size-4" />
            {saveCopyLabel}
          </LoadingButton>
        ) : null}

        {requestId && resultMode === "summary" ? (
          <LoadingButton
            onClick={handleSaveVersion}
            disabled={isBusy}
            isLoading={busyAction === "save-version"}
            loadingText="Saving..."
            className="min-h-9 border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            <Save className="size-4" />
            Save as Version
          </LoadingButton>
        ) : null}

        <Link
          href={`/documents/${documentId}/export`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          title={`Export the currently saved document. Save the ${getResultModeLabel(
            resultMode,
          )} first to export that output.`}
        >
          <FileDown className="size-4" />
          Export
        </Link>

        {requestId ? (
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <RotateCcw className="size-4" />
            Discard
          </Link>
        ) : null}
      </div>
    </footer>
  );
}
