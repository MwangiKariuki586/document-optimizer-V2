"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  FileText,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import type { AIRequestPreview } from "@/lib/ai/ai.service";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import { appToast } from "@/lib/feedback/toast";

type AIResultPreviewProps = {
  preview: AIRequestPreview;
};

type SuggestionType = "clarity" | "grammar" | "tone" | "structure" | "seo";

const suggestionLabels: Record<SuggestionType, string> = {
  clarity: "Clarity",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
  seo: "SEO",
};

const suggestionClasses: Record<
  SuggestionType,
  {
    badge: string;
    icon: string;
    bar: string;
  }
> = {
  clarity: {
    badge: "bg-ai-light text-ai-dark",
    icon: "bg-ai-light text-ai-dark",
    bar: "bg-ai",
  },
  grammar: {
    badge: "bg-success-muted text-success-foreground",
    icon: "bg-success-muted text-success-foreground",
    bar: "bg-success",
  },
  tone: {
    badge: "bg-info-muted text-info-foreground",
    icon: "bg-info-muted text-info-foreground",
    bar: "bg-info",
  },
  structure: {
    badge: "bg-success-muted text-success-foreground",
    icon: "bg-success-muted text-success-foreground",
    bar: "bg-success",
  },
  seo: {
    badge: "bg-warning-muted text-warning-foreground",
    icon: "bg-warning-muted text-warning-foreground",
    bar: "bg-warning",
  },
};

function countSuggestions(preview: AIRequestPreview) {
  return preview.output.suggestions.reduce<Record<SuggestionType, number>>(
    (acc, suggestion) => {
      acc[suggestion.type] += 1;
      return acc;
    },
    { clarity: 0, grammar: 0, tone: 0, structure: 0, seo: 0 },
  );
}

function scoreEntries(preview: AIRequestPreview) {
  const analysis = preview.output.analysis;

  return [
    { key: "clarity" as const, label: "Clarity", value: analysis.clarity ?? 86 },
    { key: "tone" as const, label: "Tone", value: analysis.tone ?? 84 },
    {
      key: "structure" as const,
      label: "Structure",
      value: analysis.structure ?? 87,
    },
    { key: "seo" as const, label: "SEO", value: analysis.seo ?? 79 },
  ];
}

export function AIResultPreview({ preview }: AIResultPreviewProps) {
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const revisedMarkdown = preview.output.revisedMarkdown?.trim() ?? "";
  const canApply = revisedMarkdown.length > 0;
  const suggestionCounts = useMemo(() => countSuggestions(preview), [preview]);
  const scores = useMemo(() => scoreEntries(preview), [preview]);
  const totalImprovements = Object.values(suggestionCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const scoreAverage = Math.round(
    scores.reduce((sum, score) => sum + score.value, 0) / scores.length,
  );

  const handleCopy = async () => {
    const text = revisedMarkdown || preview.output.summary;

    try {
      await navigator.clipboard.writeText(text);
      appToast.success("AI result copied.");
    } catch {
      appToast.error("Could not copy the AI result.");
    }
  };

  const handleApply = async () => {
    if (!canApply || isApplying) {
      return;
    }

    setIsApplying(true);

    try {
      const response = await fetch(
        `/api/documents/${preview.documentId}/ai/${preview.id}/apply`,
        { method: "POST" },
      );
      const data: {
        success: boolean;
        error?: string;
        data?: { versionNumber: number };
      } = await response.json();

      if (!response.ok || !data.success) {
        appToast.error(data.error ?? "Could not apply AI result.");
        return;
      }

      appToast.success("AI result applied. A version snapshot was created first.");
      router.push(`/documents/${preview.documentId}`);
      router.refresh();
    } catch {
      appToast.error("Could not apply AI result. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <main className="flex-1 bg-background px-3 py-3 md:px-5">
      <div className="mx-auto grid max-w-[1280px] gap-3 xl:grid-cols-[224px_minmax(0,1fr)_300px]">
        <aside className="order-2 rounded-xl border border-border bg-surface p-3 shadow-card-soft xl:order-1">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition hover:text-accent"
          >
            <ArrowLeft className="size-4" />
            Back to Documents
          </Link>
          <div className="mt-4 rounded-xl border border-border-light bg-surface-secondary p-3">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info-muted text-info-foreground">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text-primary">
                  {preview.documentTitle}
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  AI request {preview.id.slice(0, 8)}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success-foreground">
                  Result ready
                </span>
              </div>
            </div>
          </div>

          <nav className="mt-5 grid gap-1 text-sm">
            <Link
              href={`/documents/${preview.documentId}`}
              className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              Editor
            </Link>
            <span className="rounded-md bg-accent-light px-3 py-2 font-medium text-accent">
              AI Preview
            </span>
            <Link
              href={`/documents/${preview.documentId}/versions`}
              className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              Versions
            </Link>
            <Link
              href={`/documents/${preview.documentId}/export`}
              className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            >
              Export
            </Link>
          </nav>

          <div className="mt-5 rounded-xl border border-border-light bg-ai-muted p-3">
            <p className="text-xs font-semibold text-ai-dark">AI Usage</p>
            <p className="mt-2 text-[11px] leading-4 text-text-secondary">
              {preview.provider ?? "AI"} {preview.model ?? "model"} ·{" "}
              {(preview.inputTokens ?? 0) + (preview.outputTokens ?? 0)} tokens
            </p>
          </div>
        </aside>

        <section className="order-1 min-w-0 rounded-xl border border-border bg-surface shadow-card-soft xl:order-2">
          <header className="flex flex-col gap-3 border-b border-border-light p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-ai" />
                <h1 className="text-lg font-semibold text-text-primary">
                  AI Result Preview
                </h1>
              </div>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Review and compare the original document with the AI-optimized
                version before applying anything.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-accent bg-accent-light px-3 py-1.5 text-xs font-semibold text-accent"
              >
                Side by Side
              </button>
              <button
                type="button"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary"
              >
                Unified View
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-2 border-b border-border-light px-4 py-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-light px-2.5 py-1 text-xs font-semibold text-ai-dark">
              <Sparkles className="size-3.5" />
              {totalImprovements || preview.output.analysis.notes.length}{" "}
              improvements ready
            </span>
            {Object.entries(suggestionCounts)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => {
                const type = key as SuggestionType;

                return (
                  <span
                    key={type}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${suggestionClasses[type].badge}`}
                  >
                    {suggestionLabels[type]} {count}
                  </span>
                );
              })}
          </div>

          <div className="grid min-h-[540px] lg:grid-cols-2">
            <article className="border-b border-border-light p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">
                  Original
                </h2>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-text-primary">
                {preview.originalMarkdown || "No original content available."}
              </pre>
            </article>

            <article className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  AI-Optimized
                  <Sparkles className="size-3.5" />
                </h2>
                <span className="rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground">
                  Improved
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-text-primary">
                {revisedMarkdown ||
                  "This AI result is analysis-only. Review the summary and notes before deciding what to do next."}
              </pre>
            </article>
          </div>

          <footer className="flex flex-col gap-3 border-t border-border-light p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-text-primary">
              What would you like to do next?
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/documents/${preview.documentId}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
              >
                <RotateCcw className="size-4" />
                Regenerate with AI
              </Link>
              <Link
                href={`/documents/${preview.documentId}`}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
              >
                <SlidersHorizontal className="size-4" />
                Edit Preferences
              </Link>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
              >
                <Clipboard className="size-4" />
                Copy result
              </button>
              <LoadingButton
                className="px-5"
                isLoading={isApplying}
                loadingText="Applying…"
                disabled={!canApply}
                onClick={handleApply}
              >
                <Sparkles className="size-4" />
                Apply to Document
              </LoadingButton>
            </div>
          </footer>
        </section>

        <aside className="order-3 grid gap-3 xl:order-3">
          <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-ai" />
              <h2 className="text-sm font-semibold text-text-primary">
                AI Summary
              </h2>
            </div>
            <p className="mt-3 text-xs leading-5 text-text-secondary">
              {preview.output.summary}
            </p>

            <div className="mt-4 grid gap-2">
              {Object.entries(suggestionCounts)
                .filter(([, count]) => count > 0)
                .map(([key, count]) => {
                  const type = key as SuggestionType;

                  return (
                    <div
                      key={type}
                      className="rounded-lg border border-border-light bg-surface-secondary p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${suggestionClasses[type].icon}`}
                        >
                          {count}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">
                            {suggestionLabels[type]}
                          </p>
                          <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                            {count} improvement{count === 1 ? "" : "s"} ready
                            for review.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
            <h2 className="text-sm font-semibold text-text-primary">
              Document Score
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_86%,var(--color-accent-light)_0)] p-2">
                <div className="flex size-full items-center justify-center rounded-full bg-surface text-xl font-bold text-text-primary">
                  {scoreAverage}
                </div>
              </div>
              <div>
                <span className="inline-flex rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground">
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Improved
                </span>
                <p className="mt-2 text-xs leading-5 text-text-secondary">
                  Scores are estimated from the AI result and ready for review.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {scores.map((score) => (
                <div key={score.key} className="grid gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-secondary">
                      {score.label}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {score.value}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
                    <div
                      className={`h-full rounded-full ${suggestionClasses[score.key].bar}`}
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Formatting preserved
                </h2>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Applying this result creates a recoverable version snapshot
                  before replacing the document content.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
