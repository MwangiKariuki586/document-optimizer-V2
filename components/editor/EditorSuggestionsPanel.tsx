"use client";

import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  MoreVertical,
  Sparkles,
  X,
} from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";

export type SuggestionType =
  | "Clarity"
  | "Grammar"
  | "Tone"
  | "Structure"
  | "SEO";

export type SuggestionStatus = "pending" | "applied" | "ignored";

export type EditorSuggestion = {
  id: string;
  index: number;
  type: SuggestionType;
  originalText: string;
  suggestedText: string;
  explanation: string;
  status: SuggestionStatus;
};

export type SuggestionFilter = {
  key: string;
  label: string;
  count: number;
};

type EditorSuggestionsPanelProps = {
  open: boolean;
  onClose: () => void;
  onReopen: () => void;
  onOpenAIActions: () => void;
  suggestions: EditorSuggestion[];
  filters: SuggestionFilter[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
  selectedSuggestionIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onReviewAllSuggestions: () => void;
  onReviewSelectedSuggestions: () => void;
  onReviewSuggestion: (id: string) => void;
  totalCount: number;
  pendingCount: number;
  onIgnoreSuggestion: (id: string) => void;
  isLoading?: boolean;
  reviewingSuggestionId?: string | null;
  ignoringSuggestionId?: string | null;
  isReviewingAll?: boolean;
  isReviewingSelected?: boolean;
  activeSuggestionId?: string | null;
  onFocusSuggestion?: (id: string) => void;
};

const typeBadgeClasses: Record<SuggestionType, string> = {
  Clarity: "bg-info-muted text-info-foreground",
  Grammar: "bg-success-muted text-success-foreground",
  Tone: "bg-ai-muted text-ai-dark",
  Structure: "bg-warning-muted text-warning-foreground",
  SEO: "bg-accent-light text-accent",
};

const statusBadgeClasses: Record<SuggestionStatus, string> = {
  pending: "bg-accent-light text-accent",
  applied: "bg-success-light text-success-foreground",
  ignored: "bg-surface-tertiary text-text-muted",
};

const statusLabels: Record<SuggestionStatus, string> = {
  pending: "Pending",
  applied: "Applied",
  ignored: "Ignored",
};

const cardStateClasses: Record<SuggestionStatus, string> = {
  pending: "border-ai-light bg-ai-muted",
  applied: "border-success-light bg-success-muted",
  ignored: "border-border bg-surface-secondary",
};

export function EditorSuggestionsPanel({
  open,
  onClose,
  onReopen,
  onOpenAIActions,
  suggestions,
  filters,
  activeFilter,
  onFilterChange,
  selectedSuggestionIds,
  onSelectionChange,
  onReviewAllSuggestions,
  onReviewSelectedSuggestions,
  onReviewSuggestion,
  totalCount,
  pendingCount,
  onIgnoreSuggestion,
  isLoading = false,
  reviewingSuggestionId = null,
  ignoringSuggestionId = null,
  isReviewingAll = false,
  isReviewingSelected = false,
  activeSuggestionId = null,
  onFocusSuggestion,
}: EditorSuggestionsPanelProps) {
  const hasSuggestions = suggestions.length > 0;
  const canReviewAll = pendingCount > 0;
  const selectedCount = selectedSuggestionIds.length;
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeSuggestionId) {
      return;
    }

    cardRefs.current[activeSuggestionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeSuggestionId]);

  const handleSelectionToggle = (suggestionId: string) => {
    onSelectionChange(
      selectedSuggestionIds.includes(suggestionId)
        ? selectedSuggestionIds.filter((id) => id !== suggestionId)
        : [...selectedSuggestionIds, suggestionId],
    );
  };

  return (
    <div className="flex flex-col xl:h-full xl:min-h-0">
      {open ? (
        <section className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
          <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-border-light p-3">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-xs font-medium text-accent transition hover:bg-surface-secondary"
            >
              <Download className="size-4" />
              Export
            </button>
            <button
              type="button"
              onClick={onOpenAIActions}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-card-soft transition hover:bg-accent-dark"
            >
              <Sparkles className="size-4" />
              AI Assistant
            </button>
          </div>

          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-ai" />
              <h2 className="text-sm font-semibold text-text-primary">
                AI Suggestions
              </h2>
              <span className="rounded-full bg-ai-light px-2 py-0.5 text-xs font-semibold text-ai-dark">
                {totalCount}
              </span>
              <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
                {pendingCount} pending
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
              title="Close suggestions"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border-light px-3 py-2">
            {filters.map((filter) => {
              const isActive = filter.key === activeFilter;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => onFilterChange(filter.key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {filter.label} {filter.count}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto p-3 xl:min-h-0 xl:flex-1">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary p-5 text-center">
                <p className="text-xs text-text-secondary">Loading suggestions…</p>
              </div>
            ) : hasSuggestions ? (
              suggestions.map((suggestion) => {
                const isReviewed = suggestion.status !== "pending";
                const isReviewingThis = reviewingSuggestionId === suggestion.id;
                const isIgnoringThis = ignoringSuggestionId === suggestion.id;
                const isSelected = selectedSuggestionIds.includes(suggestion.id);
                const isActive = activeSuggestionId === suggestion.id;
                const isBusy =
                  isReviewingAll ||
                  isReviewingSelected ||
                  isReviewingThis ||
                  isIgnoringThis;

                return (
                  <article
                    key={suggestion.id}
                    ref={(element) => {
                      cardRefs.current[suggestion.id] = element;
                    }}
                    data-suggestion-id={suggestion.id}
                    onClick={() => onFocusSuggestion?.(suggestion.id)}
                    className={`rounded-xl border p-3 transition ${
                      isActive
                        ? "border-accent bg-accent-muted shadow-card-soft"
                        : cardStateClasses[suggestion.status]
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isReviewed || isBusy}
                          onChange={() => handleSelectionToggle(suggestion.id)}
                          className="mt-0.5 size-4 rounded border-border text-accent"
                          aria-label={`Select suggestion ${suggestion.index}`}
                        />
                        <span className="flex size-5 items-center justify-center rounded-md bg-surface text-[11px] font-semibold text-text-secondary">
                          {suggestion.index}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClasses[suggestion.type]}`}
                        >
                          {suggestion.type}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses[suggestion.status]}`}
                        >
                          {suggestion.status === "applied" ? (
                            <CheckCircle2 className="size-3" />
                          ) : null}
                          {statusLabels[suggestion.status]}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-surface hover:text-text-primary"
                        title="More options"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg border border-border-light bg-surface p-2.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                          Original text
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                          {suggestion.originalText}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border-light bg-surface p-2.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-success-foreground">
                          Suggested text
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-primary">
                          {suggestion.suggestedText}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                          Why this helps
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                          {suggestion.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <LoadingButton
                        onClick={() => onReviewSuggestion(suggestion.id)}
                        disabled={isReviewed || isBusy}
                        isLoading={isReviewingThis}
                        loadingText="Opening…"
                        className="h-8 px-3 py-1.5 text-xs"
                      >
                        {suggestion.status === "applied" ? "Applied" : "Review"}
                      </LoadingButton>
                      <LoadingButton
                        onClick={() => onIgnoreSuggestion(suggestion.id)}
                        disabled={isReviewed || isBusy}
                        isLoading={isIgnoringThis}
                        loadingText="Ignoring…"
                        className="h-8 border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-secondary"
                      >
                        {suggestion.status === "ignored" ? "Ignored" : "Ignore"}
                      </LoadingButton>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary p-5 text-center">
                <div>
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-accent-lighter text-accent">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text-primary">
                    No suggestions yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-[220px] text-xs leading-5 text-text-secondary">
                    Run an AI action to generate document improvement
                    suggestions, then review each change before applying it.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border-light p-3">
            <LoadingButton
              onClick={onReviewSelectedSuggestions}
              disabled={
                selectedCount === 0 ||
                isReviewingSelected ||
                isReviewingAll ||
                Boolean(reviewingSuggestionId) ||
                Boolean(ignoringSuggestionId)
              }
              isLoading={isReviewingSelected}
              loadingText="Opening review…"
              className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-dark"
            >
              <Sparkles className="size-4" />
              {selectedCount > 0
                ? `Review Selected ${selectedCount}`
                : "Select Suggestions to Review"}
            </LoadingButton>
            <LoadingButton
              onClick={onReviewAllSuggestions}
              disabled={
                !canReviewAll ||
                isReviewingAll ||
                isReviewingSelected ||
                Boolean(reviewingSuggestionId) ||
                Boolean(ignoringSuggestionId)
              }
              isLoading={isReviewingAll}
              loadingText="Opening review…"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent! bg-surface! px-4 py-2 text-sm font-semibold text-accent! hover:bg-accent-light! disabled:border-border! disabled:bg-surface! disabled:text-text-muted!"
            >
              <Sparkles className="size-4" />
              {canReviewAll
                ? `Review All ${pendingCount} Pending Suggestions`
                : "All Suggestions Reviewed"}
            </LoadingButton>
            <p className="mt-2 text-center text-[11px] leading-4 text-text-muted">
              Suggestions can only be applied after preview review.
            </p>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={onReopen}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary"
        >
          <Sparkles className="size-4 text-ai" />
          Show AI Suggestions
        </button>
      )}
    </div>
  );
}
