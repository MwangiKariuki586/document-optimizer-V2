import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";

type PreviewActionBarProps = {
  documentId: string;
  canApply: boolean;
  isApplying: boolean;
  showRegenerate: boolean;
  onApply: () => void;
};

export function PreviewActionBar({
  documentId,
  canApply,
  isApplying,
  showRegenerate,
  onApply,
}: PreviewActionBarProps) {
  const [safetyOpen, setSafetyOpen] = useState(false);

  return (
    <footer className="flex shrink-0 flex-col gap-2 rounded-xl  px-4 py-2  lg:flex-row lg:items-center lg:justify-center">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
        {showRegenerate ? (
          <Link
            href={`/documents/${documentId}`}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-1.5 text-sm font-medium text-accent transition hover:bg-surface-secondary"
          >
            <RotateCcw className="size-4" />
            Regenerate
          </Link>
        ) : null}

        <Link
          href={`/documents/${documentId}`}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-1.5 text-sm font-medium text-accent transition hover:bg-surface-secondary"
        >
          <Undo2 className="size-4" />
          Return to Editor
        </Link>

        <LoadingButton
          className="min-h-9 px-7"
          isLoading={isApplying}
          loadingText="Applying..."
          disabled={!canApply}
          onClick={onApply}
        >
          <Sparkles className="size-4" />
          Apply to Document
        </LoadingButton>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setSafetyOpen((current) => !current)}
          className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border-light bg-surface-secondary px-3 py-2 text-xs font-medium text-text-secondary transition hover:bg-surface"
          aria-expanded={safetyOpen}
        >
          <ShieldCheck className="size-3.5 text-accent" />
          <span>Safety checks passed</span>
          <ChevronDown
            className={`size-3.5 text-text-muted transition ${
              safetyOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {safetyOpen ? (
          <div className="absolute bottom-full right-0 z-30 mb-2 w-72 rounded-xl border border-border bg-surface p-3 shadow-popover">
            <div className="grid gap-1.5 text-[11px] leading-4 text-text-secondary">
              {[
                "Original file preserved.",
                "Formatting remains reviewable.",
                "Version snapshot before apply.",
              ].map((item) => (
                <p key={item} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </footer>
  );
}
