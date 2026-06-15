"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  History,
  Info,
  PencilLine,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { ChangeNavigator } from "@/components/ai/ChangeNavigator";
import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import type { ChangeSummaryType } from "@/components/ai/ChangeSummary";
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

const previewNavItems = [
  {
    label: "Editor",
    icon: PencilLine,
    href: (documentId: string) => `/documents/${documentId}`,
  },
  {
    label: "AI Suggestions",
    icon: Sparkles,
    active: true,
  },
  {
    label: "Versions",
    icon: History,
    href: (documentId: string) => `/documents/${documentId}/versions`,
  },
  {
    label: "Export",
    icon: Download,
    href: (documentId: string) => `/documents/${documentId}/export`,
  },
  {
    label: "Document Info",
    icon: Info,
  },
];

function countSuggestions(suggestions: { type: SuggestionType }[]) {
  return suggestions.reduce<Record<SuggestionType, number>>(
    (acc, suggestion) => {
      acc[suggestion.type] += 1;
      return acc;
    },
    { clarity: 0, grammar: 0, tone: 0, structure: 0, seo: 0 },
  );
}

function truncateLabel(value: string, fallback: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;
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
      const currentIndex = input.currentMarkdown.indexOf(
        suggestion.originalText,
      );
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
        "Compare your current document with the proposed AI revision. Edit the proposed version before applying.",
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
      "Compare your current document with the proposed AI revision. Edit the proposed version before applying.",
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
    usageLabel: `${data.suggestions.length} suggestion${
      data.suggestions.length === 1 ? "" : "s"
    } ready for review`,
    showRegenerate: false,
  };
}

export function AIResultPreview({ preview }: AIResultPreviewProps) {
  const router = useRouter();
  const display = useMemo(() => normalizePreview(preview), [preview]);
  const suggestionCounts = useMemo(
    () => countSuggestions(display.suggestions),
    [display.suggestions],
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>("side-by-side");
  const [syncScroll, setSyncScroll] = useState(true);
  const [comparisonSettingsOpen, setComparisonSettingsOpen] = useState(false);
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
  const changeTotal = totalImprovements || display.suggestions.length;
  const changedCategoryCount =
    Object.values(suggestionCounts).filter(Boolean).length || 1;
  const canApply =
    proposedMarkdown.trim().length > 0 && (display.canApply || proposedEdited);

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
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-cols-[252px_minmax(0,1fr)] xl:overflow-hidden">
        <aside className="order-2 rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:order-1 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
          <div className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition hover:text-text-primary"
            >
              <ArrowLeft className="size-4" />
              Back to Documents
            </Link>

            <div className="mt-4 rounded-xl border border-border-light bg-surface p-3 shadow-card-soft">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-muted text-info-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {display.documentTitle}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-text-muted">
                    {display.sourceLabel}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success-foreground">
                    <CheckCircle2 className="size-3" />
                    Saved
                  </span>
                  <p className="mt-2 inline-flex rounded-md bg-success-muted px-2 py-1 text-[11px] font-medium text-success-foreground">
                    {display.statusLabel}
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-5 grid gap-1 text-sm">
              {previewNavItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {item.label}
                    </span>
                    {item.active ? (
                      <span className="rounded-full bg-accent-lighter px-2 py-0.5 text-[11px] font-semibold text-accent">
                        {changeTotal}
                      </span>
                    ) : null}
                  </>
                );
                const className = `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${
                  item.active
                    ? "bg-accent-light text-accent"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`;

                if (item.href) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href(display.documentId)}
                      className={className}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={className}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {content}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-4 grid shrink-0 gap-3">
            <div className="rounded-xl border border-border bg-surface p-3 shadow-card-soft">
              <p className="text-xs font-semibold text-text-primary">
                AI Usage{" "}
                <span className="font-normal text-text-muted">
                  (This month)
                </span>
              </p>
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                {display.usageLabel}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-[11px] text-text-muted">
                Resets in 18 days
              </p>
            </div>

            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left shadow-card-soft transition hover:bg-surface-secondary"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                AJ
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">
                  Alex Johnson
                </span>
                <span className="block truncate text-xs text-text-muted">
                  alex@example.com
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-text-muted" />
            </button>
          </div>
        </aside>

        <section className="order-1 min-w-0 xl:order-2 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
          <h1 className="sr-only">{display.title}</h1>

          {display.warnings.length > 0 ? (
            <div className="grid shrink-0 gap-2 rounded-xl border border-warning bg-warning-muted px-4 py-2">
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

          <div className="grid min-h-0 gap-3 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:overflow-hidden">
            <div className="min-w-0 xl:flex xl:min-h-0 xl:flex-col xl:overflow-hidden">
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
              <div className="mt-2 shrink-0">
                <PreviewActionBar
                  documentId={display.documentId}
                  canApply={canApply}
                  isApplying={isApplying}
                  showRegenerate={display.showRegenerate}
                  onApply={handleApply}
                />
              </div>
            </div>

            <aside className="grid min-h-0 gap-3 rounded-xl border border-accent-light bg-accent-muted p-3 shadow-card-soft xl:flex xl:h-full xl:flex-col xl:overflow-hidden">
              <section className="rounded-xl border border-border-light bg-surface p-3">
                <button
                  type="button"
                  onClick={() =>
                    setComparisonSettingsOpen((current) => !current)
                  }
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={comparisonSettingsOpen}
                >
                  <span>
                    <span className="block text-xs font-semibold text-text-primary">
                      Comparison settings
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-text-muted">
                      {previewMode === "side-by-side"
                        ? "Side-by-side"
                        : "Proposed only"}{" "}
                      · Sync {syncScroll ? "on" : "off"}
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-text-muted transition ${
                      comparisonSettingsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {comparisonSettingsOpen ? (
                  <div className="mt-3 grid gap-2">
                  <PreviewModeToggle
                    value={previewMode}
                    onChange={setPreviewMode}
                  />
                  <SyncScrollToggle
                    enabled={syncScroll}
                    onChange={setSyncScroll}
                  />
                  </div>
                ) : null}
              </section>

              <ChangeNavigator
                changes={changeAnchors}
                activeChangeId={activeChangeId}
                onSelect={setActiveChangeId}
              />

              <section className="rounded-xl border border-border-light bg-surface p-4 xl:shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-ai" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    AI Summary
                  </h2>
                </div>
                <p className="mt-3 text-xs leading-5 text-text-secondary">
                  {display.summary ||
                    "Here is what the AI improved in your document."}
                </p>
                <div className="mt-3 rounded-lg border border-border-light bg-surface-secondary px-3 py-2">
                  <p className="text-[11px] font-semibold text-text-primary">
                    {changeTotal} proposed change
                    {changeTotal === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
                    Across {changedCategoryCount} key area
                    {changedCategoryCount === 1 ? "" : "s"}. Preview only -
                    your document has not changed yet.
                  </p>
                </div>

              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
