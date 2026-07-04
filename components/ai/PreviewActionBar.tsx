"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, FileDown, Undo2 } from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";
import { appToast } from "@/lib/feedback/toast";

type ResultMode = "optimization" | "summary" | "translation";

type PreviewActionBarProps = {
  documentId: string;
  requestId?: string;
  resultMode?: ResultMode;
  proposedMarkdown?: string;
};

type ApplyAIResultResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    versionNumber: number;
  };
};

export function PreviewActionBar({
  documentId,
  requestId,
  resultMode = "optimization",
  proposedMarkdown = "",
}: PreviewActionBarProps) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"apply" | null>(null);
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
      const data: ApplyAIResultResponse = await response.json();

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

  const copyLabel =
    resultMode === "translation" ? "Copy Translation" : "Copy Result";
  const canCopyResult = proposedMarkdown.trim().length > 0;
  const exportHref = requestId
    ? `/documents/${documentId}/export?requestId=${encodeURIComponent(requestId)}`
    : `/documents/${documentId}/export`;

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

        {canCopyResult ? (
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

        <Link
          href={exportHref}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          <FileDown className="size-4" />
          Export
        </Link>
      </div>
    </footer>
  );
}
