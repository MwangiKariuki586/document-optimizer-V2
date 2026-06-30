"use client";

import { useMemo, useState } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";

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
import type { AIRequestPreview } from "@/lib/ai/ai.types";
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
  conciseness: "Conciseness",
  formatting: "Formatting",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
};

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
    explanation?: string;
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
        originalText: suggestion.originalText,
        suggestedText: suggestion.suggestedText,
        explanation: suggestion.explanation,
        currentIndex: Math.max(0, currentIndex),
        proposedIndex: Math.max(0, proposedIndex),
      };
    })
    .filter((change): change is PreviewChangeAnchor => change !== null);
}

function getPreviewModeLabel(mode: PreviewMode): string {
  if (mode === "side-by-side") {
    return "Side-by-side";
  }

  return "Proposed only";
}

function normalizePreview(preview: PreviewPayload) {
  if (preview.kind === "ai_request") {
    const data = preview.data;
    const revisedMarkdown = data.output.revisedMarkdown?.trim() ?? "";
    const resultMode = data.output.resultMode ?? "optimization";
    const title =
      resultMode === "summary"
        ? "Summary Result"
        : resultMode === "translation"
          ? "Translation Result"
          : "Optimization Result";
    const description =
      resultMode === "summary"
        ? "Review the generated summary or shortened version before saving it."
        : resultMode === "translation"
          ? "Review the translated document while keeping the original unchanged."
          : "Compare your current document with the proposed AI revision before applying it.";

    return {
      kind: preview.kind,
      id: data.id,
      documentId: data.documentId,
      documentTitle: data.documentTitle,
      sourceLabel: `AI request ${data.id.slice(0, 8)}`,
      statusLabel: "Result ready",
      title,
      description,
      originalMarkdown: data.originalMarkdown,
      originalEditorJson: data.originalEditorJson,
      proposedMarkdown: revisedMarkdown,
      proposedEditorJson: null,
      emptyProposedText:
        "This AI result is analysis-only.",
      summary: data.output.summary,
      warnings: data.output.warnings,
      suggestions: data.output.suggestions,
      resultMode,
      usageLabel: `${data.provider ?? "AI"} ${data.model ?? "model"} - ${
        (data.inputTokens ?? 0) + (data.outputTokens ?? 0)
      } tokens`,
    };
  }

  const data = preview.data;
  const isSingle = data.kind === "single_suggestion";
  const isAppliedReview = data.kind === "applied_suggestions";

  return {
    kind: preview.kind,
    id: data.id,
    documentId: data.documentId,
    documentTitle: data.documentTitle,
    sourceLabel: isAppliedReview
      ? "Applied suggestions"
      : isSingle
        ? `Suggestion ${data.id.slice(0, 8)}`
        : `Selection ${data.id.slice(0, 8)}`,
    statusLabel: isAppliedReview
      ? "Applied review"
      : isSingle
        ? "Suggestion ready"
        : "Selection ready",
    title: isAppliedReview
      ? "Applied Suggestions Review"
      : isSingle
        ? "Suggestion Preview"
        : "Multi-Suggestion Preview",
    description: isAppliedReview
      ? "Compare the before state with the current document after applied AI suggestions."
      : "Compare your current document with the proposed AI revision. Edit the proposed version before applying.",
    originalMarkdown: data.originalMarkdown,
    proposedMarkdown: data.proposedMarkdown,
    originalEditorJson: data.originalEditorJson,
    proposedEditorJson: data.proposedEditorJson,
    emptyProposedText:
      "This suggestion cannot be shown as an automatic full-document replacement.",
    summary: data.summary,
    warnings: data.warnings,
    suggestions: data.suggestions,
    resultMode: undefined,
    usageLabel: `${data.suggestions.length} suggestion${
      data.suggestions.length === 1 ? "" : "s"
    } ready for review`,
  };
}

export function AIResultPreview({ preview }: AIResultPreviewProps) {
  const display = useMemo(() => normalizePreview(preview), [preview]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("side-by-side");
  const [syncScroll, setSyncScroll] = useState(true);
  const [comparisonSettingsOpen, setComparisonSettingsOpen] = useState(false);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);

  const changeAnchors = useMemo(
    () =>
      buildChangeAnchors({
        currentMarkdown: display.originalMarkdown,
        proposedMarkdown: display.proposedMarkdown,
        suggestions: display.suggestions,
      }),
    [display.originalMarkdown, display.proposedMarkdown, display.suggestions],
  );
  const effectiveActiveChangeId =
    activeChangeId &&
    changeAnchors.some((change) => change.id === activeChangeId)
      ? activeChangeId
      : (changeAnchors[0]?.id ?? null);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden">
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:overflow-hidden">
        <section className="min-w-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
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
                currentEditorJson={display.originalEditorJson}
                initialProposedMarkdown={display.proposedMarkdown}
                initialProposedEditorJson={display.proposedEditorJson}
                currentProposedMarkdown={display.proposedMarkdown}
                emptyProposedText={display.emptyProposedText}
                changes={changeAnchors}
                activeChangeId={effectiveActiveChangeId}
                onSelectChange={setActiveChangeId}
              />

              <div className="mt-2 shrink-0">
                <PreviewActionBar
                  documentId={display.documentId}
                  requestId={display.kind === "ai_request" ? display.id : undefined}
                  resultMode={display.resultMode}
                  proposedMarkdown={display.proposedMarkdown}
                />
              </div>
            </div>

            <aside className="grid min-h-0 min-w-0 gap-3 overflow-hidden rounded-xl bg-accent-muted xl:flex xl:h-full xl:flex-col">
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
                      {getPreviewModeLabel(previewMode)} · Sync{" "}
                      {syncScroll ? "on" : "off"}
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
                activeChangeId={effectiveActiveChangeId}
                onSelect={setActiveChangeId}
              />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
