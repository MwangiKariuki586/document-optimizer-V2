"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { ChangeNavigator } from "@/components/ai/ChangeNavigator";
import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import {
  ChangeSummary,
  type ChangeSummaryType,
} from "@/components/ai/ChangeSummary";
import { PreviewActionBar } from "@/components/ai/PreviewActionBar";
import { PreviewComparison } from "@/components/ai/PreviewComparison";
import {
  PreviewModeToggle,
  type PreviewMode,
} from "@/components/ai/PreviewModeToggle";
import { SyncScrollToggle } from "@/components/ai/SyncScrollToggle";
import type { AIRequestPreview } from "@/lib/ai/ai.service";
import { appToast } from "@/lib/feedback/toast";
import type { SuggestionPreview } from "@/lib/suggestions/suggestions.types";

export type PreviewPayload =
  | {
      kind: "ai_request";
      data: AIRequestPreview;
    }
  | {
      kind: "suggestion";
      data: SuggestionPreview;
    };

type AIResultPreviewProps = {
  preview: PreviewPayload;
};

type SuggestionType = ChangeSummaryType;

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
    badge: "bg-warning-muted text-warning-foreground",
    icon: "bg-warning-muted text-warning-foreground",
    bar: "bg-warning",
  },
  seo: {
    badge: "bg-accent-light text-accent",
    icon: "bg-accent-light text-accent",
    bar: "bg-accent",
  },
};

function countSuggestions(suggestions: { type: SuggestionType }[]) {
  return suggestions.reduce<Record<SuggestionType, number>>(
    (acc, suggestion) => {
      acc[suggestion.type] += 1;
      return acc;
    },
    { clarity: 0, grammar: 0, tone: 0, structure: 0, seo: 0 },
  );
}

function scoreEntries(preview: PreviewPayload) {
  const analysis =
    preview.kind === "ai_request" ? preview.data.output.analysis : null;

  return [
    {
      key: "clarity" as const,
      label: "Clarity",
      value: analysis?.clarity ?? 86,
    },
    { key: "tone" as const, label: "Tone", value: analysis?.tone ?? 84 },
    {
      key: "structure" as const,
      label: "Structure",
      value: analysis?.structure ?? 87,
    },
    { key: "seo" as const, label: "SEO", value: analysis?.seo ?? 79 },
  ];
}

function truncateLabel(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 48 ? `${normalized.slice(0, 45)}...` : normalized;
}

function buildChangeAnchors(input: {
  currentMarkdown: string;
  proposedMarkdown: string;
  suggestions: Array<{
    id?: string;
    type: SuggestionType;
    originalText: string;
    suggestedText: string;
  }>;
}): PreviewChangeAnchor[] {
  return input.suggestions
    .map((suggestion, index) => {
      const currentIndex = input.currentMarkdown.indexOf(suggestion.originalText);
      const proposedIndex = input.proposedMarkdown.indexOf(
        suggestion.suggestedText,
      );

      if (currentIndex < 0 && proposedIndex < 0) {
        return null;
      }

      return {
        id: suggestion.id ?? `${suggestion.type}-${index}`,
        label: truncateLabel(
          suggestion.originalText || suggestion.suggestedText,
          `${suggestionLabels[suggestion.type]} change`,
        ),
        type: suggestion.type,
        currentIndex: Math.max(0, currentIndex),
        proposedIndex: Math.max(0, proposedIndex),
      };
    })
    .filter((change): change is PreviewChangeAnchor => change !== null);
}

function getSuggestionAnchorId(
  suggestion: { id?: string; type: SuggestionType },
  index: number,
): string {
  return suggestion.id ?? `${suggestion.type}-${index}`;
}

function normalizePreview(preview: PreviewPayload) {
  if (preview.kind === "ai_request") {
    const data = preview.data;
    const revisedMarkdown = data.output.revisedMarkdown?.trim() ?? "";

    return {
      kind: preview.kind,
      id: data.id,
      documentId: data.documentId,
      documentTitle: data.documentTitle,
      sourceLabel: `AI request ${data.id.slice(0, 8)}`,
      statusLabel: "Result ready",
      title: "AI Result Preview",
      description:
        "Review, edit, and approve the proposed AI result before it changes your document.",
      originalMarkdown: data.originalMarkdown,
      proposedMarkdown: revisedMarkdown,
      emptyProposedText:
        "This AI result is analysis-only. You can still draft a proposed result here before applying.",
      summary: data.output.summary,
      warnings: data.output.warnings,
      suggestions: data.output.suggestions,
      canApply: revisedMarkdown.length > 0,
      applyUrl: `/api/documents/${data.documentId}/ai/${data.id}/apply`,
      applyError: "Could not apply AI result.",
      applySuccess: "AI result applied. A version snapshot was created first.",
      copySuccess: "Proposed result copied.",
      copyError: "Could not copy the proposed result.",
      usageLabel: `${data.provider ?? "AI"} ${data.model ?? "model"} - ${
        (data.inputTokens ?? 0) + (data.outputTokens ?? 0)
      } tokens`,
      showRegenerate: true,
    };
  }

  const data = preview.data;
  const isSingle = data.kind === "single_suggestion";

  return {
    kind: preview.kind,
    id: data.id,
    documentId: data.documentId,
    documentTitle: data.documentTitle,
    sourceLabel: isSingle
      ? `Suggestion ${data.id.slice(0, 8)}`
      : `Selection ${data.id.slice(0, 8)}`,
    statusLabel: isSingle ? "Suggestion ready" : "Selection ready",
    title: isSingle ? "Suggestion Preview" : "Multi-Suggestion Preview",
    description:
      "Review, edit, and approve the proposed suggestion result before it changes your document.",
    originalMarkdown: data.originalMarkdown,
    proposedMarkdown: data.proposedMarkdown,
    emptyProposedText:
      "This suggestion cannot be applied safely as an automatic replacement. Edit the proposed result to apply a reviewed full-document result.",
    summary: data.summary,
    warnings: data.warnings,
    suggestions: data.suggestions,
    canApply: data.canApply,
    applyUrl: isSingle
      ? `/api/documents/${data.documentId}/suggestions/${data.id}/apply`
      : `/api/documents/${data.documentId}/suggestions/selections/${
          data.selectionId ?? data.id
        }/apply`,
    applyError: "Could not apply suggestion changes.",
    applySuccess:
      "Suggestion changes applied. A version snapshot was created first.",
    copySuccess: "Proposed result copied.",
    copyError: "Could not copy the proposed result.",
    usageLabel: `${data.suggestions.length} suggestion${
      data.suggestions.length === 1 ? "" : "s"
    } ready for review`,
    showRegenerate: false,
  };
}

export function AIResultPreview({ preview }: AIResultPreviewProps) {
  const router = useRouter();
  const display = useMemo(() => normalizePreview(preview), [preview]);
  const scores = useMemo(() => scoreEntries(preview), [preview]);
  const suggestionCounts = useMemo(
    () => countSuggestions(display.suggestions),
    [display.suggestions],
  );
  const scoreAverage = Math.round(
    scores.reduce((sum, score) => sum + score.value, 0) / scores.length,
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>("side-by-side");
  const [syncScroll, setSyncScroll] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [proposedMarkdown, setProposedMarkdown] = useState(
    display.proposedMarkdown,
  );
  const [proposedEdited, setProposedEdited] = useState(false);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);

  const totalImprovements = Object.values(suggestionCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const changeAnchors = useMemo(
    () =>
      buildChangeAnchors({
        currentMarkdown: display.originalMarkdown,
        proposedMarkdown,
        suggestions: display.suggestions,
      }),
    [display.originalMarkdown, display.suggestions, proposedMarkdown],
  );
  const canApply =
    proposedMarkdown.trim().length > 0 && (display.canApply || proposedEdited);

  const handleCopy = async () => {
    const text = proposedMarkdown || display.summary;

    try {
      await navigator.clipboard.writeText(text);
      appToast.success(display.copySuccess);
    } catch {
      appToast.error(display.copyError);
    }
  };

  const handleApply = async () => {
    if (!canApply || isApplying) {
      return;
    }

    setIsApplying(true);

    try {
      const response = await fetch(display.applyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedMarkdown: proposedMarkdown }),
      });
      const data: {
        success: boolean;
        error?: string;
        data?: { versionNumber: number };
      } = await response.json();

      if (!response.ok || !data.success) {
        appToast.error(data.error ?? display.applyError);
        return;
      }

      appToast.success(display.applySuccess);
      router.push(`/documents/${display.documentId}`);
      router.refresh();
    } catch {
      appToast.error(`${display.applyError} Please try again.`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:max-h-[calc(100vh-73px)] xl:overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col gap-3 xl:overflow-hidden">
        <div className="grid min-h-0 gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[224px_minmax(0,1fr)_300px] xl:grid-rows-1 xl:overflow-hidden">
          <aside className="order-2 rounded-xl border border-border bg-surface p-3 shadow-card-soft xl:order-1 xl:h-full xl:min-h-0 xl:overflow-y-auto">
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
                    {display.documentTitle}
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">
                    {display.sourceLabel}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success-foreground">
                    {display.statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <nav className="mt-5 grid gap-1 text-sm">
              <Link
                href={`/documents/${display.documentId}`}
                className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                Editor
              </Link>
              <span className="rounded-md bg-accent-light px-3 py-2 font-medium text-accent">
                AI Preview
              </span>
              <Link
                href={`/documents/${display.documentId}/versions`}
                className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                Versions
              </Link>
              <Link
                href={`/documents/${display.documentId}/export`}
                className="rounded-md px-3 py-2 text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
              >
                Export
              </Link>
            </nav>

            <div className="mt-5 rounded-xl border border-border-light bg-ai-muted p-3">
              <p className="text-xs font-semibold text-ai-dark">AI Usage</p>
              <p className="mt-2 text-[11px] leading-4 text-text-secondary">
                {display.usageLabel}
              </p>
            </div>
          </aside>

          <section className="order-1 min-w-0 rounded-xl border border-border bg-surface shadow-card-soft xl:order-2 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
            <header className="flex shrink-0 flex-col gap-3 border-b border-border-light p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-ai" />
                  <h1 className="text-lg font-semibold text-text-primary">
                    {display.title}
                  </h1>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  {display.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PreviewModeToggle
                  value={previewMode}
                  onChange={setPreviewMode}
                />
                <SyncScrollToggle
                  enabled={syncScroll}
                  onChange={setSyncScroll}
                />
              </div>
            </header>

            <div className="shrink-0 border-b border-border-light p-3">
              <ChangeSummary
                summary={display.summary}
                counts={suggestionCounts}
                totalChanges={totalImprovements || display.suggestions.length}
              />
            </div>

            {display.warnings.length > 0 ? (
              <div className="grid shrink-0 gap-2 border-b border-border-light bg-warning-muted px-4 py-3">
                {display.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-2 text-xs leading-5 text-warning-foreground"
                  >
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <PreviewComparison
              mode={previewMode}
              syncScroll={syncScroll}
              currentMarkdown={display.originalMarkdown}
              initialProposedMarkdown={display.proposedMarkdown}
              currentProposedMarkdown={proposedMarkdown}
              emptyProposedText={display.emptyProposedText}
              edited={proposedEdited}
              changes={changeAnchors}
              activeChangeId={activeChangeId}
              onProposedMarkdownChange={setProposedMarkdown}
              onProposedEditedChange={setProposedEdited}
            />

            <PreviewActionBar
              documentId={display.documentId}
              canApply={canApply}
              edited={proposedEdited}
              isApplying={isApplying}
              showRegenerate={display.showRegenerate}
              onCopy={handleCopy}
              onApply={handleApply}
            />
          </section>

          <aside className="order-3 grid gap-3 xl:order-3 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
            <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:overflow-hidden xl:p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-ai" />
                <h2 className="text-sm font-semibold text-text-primary">
                  AI Summary
                </h2>
              </div>
              <p className="mt-3 text-xs leading-5 text-text-secondary xl:line-clamp-3">
                {display.summary}
              </p>

              <div className="mt-4 grid gap-2 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
                {display.suggestions.length > 0 ? (
                  display.suggestions.map((suggestion, index) => {
                    const type = suggestion.type;

                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.originalText}-${index}`}
                        type="button"
                        onClick={() =>
                          setActiveChangeId(getSuggestionAnchorId(suggestion, index))
                        }
                        className="rounded-lg border border-border-light bg-surface-secondary p-3 text-left transition hover:border-border-strong xl:p-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${suggestionClasses[type].icon}`}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-text-primary">
                              {suggestionLabels[type]}
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-text-secondary xl:line-clamp-2">
                              {suggestion.explanation ||
                                "Review this suggested change before applying it."}
                            </p>
                            {"safety" in suggestion &&
                            suggestion.safety !== "safe" ? (
                              <p className="mt-2 text-[11px] font-medium text-warning-foreground">
                                Needs review: {suggestion.safety}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-border-light bg-surface-secondary p-3">
                    <p className="text-xs font-semibold text-text-primary">
                      Full-document result
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                      Review the proposed document result in the comparison
                      workspace.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <ChangeNavigator
              changes={changeAnchors}
              activeChangeId={activeChangeId}
              onSelect={setActiveChangeId}
            />

            <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:shrink-0 xl:p-3">
              <h2 className="text-sm font-semibold text-text-primary">
                Document Score
              </h2>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_86%,var(--color-accent-light)_0)] p-2">
                  <div className="flex size-full items-center justify-center rounded-full bg-surface text-xl font-bold text-text-primary">
                    {scoreAverage}
                  </div>
                </div>
                <div>
                  <span className="inline-flex rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground">
                    <CheckCircle2 className="mr-1 size-3.5" />
                    Improved
                  </span>
                  <p className="mt-2 text-[11px] leading-4 text-text-secondary">
                    Scores are estimated from the AI result and ready for
                    review.
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-1.5">
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

            <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:shrink-0 xl:p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Version-safe apply
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Applying creates a recoverable version snapshot first. The
                    edited proposed result is what gets applied.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
