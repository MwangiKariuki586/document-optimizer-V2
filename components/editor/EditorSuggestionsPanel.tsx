"use client";

import { Fragment, useEffect, useRef } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Highlighter,
  MoreVertical,
  Sparkles,
  X,
} from "lucide-react";

import { LoadingButton } from "@/components/feedback/LoadingButton";
import type { AIActionRun } from "@/lib/ai/ai.types";

export type SuggestionType =
  | "Clarity"
  | "Conciseness"
  | "Formatting"
  | "Grammar"
  | "Tone"
  | "Structure";

export type SuggestionStatus = "pending" | "applied" | "ignored";

export type EditorSuggestion = {
  id: string;
  index: number;
  aiRequestId: string | null;
  createdAt: string;
  type: SuggestionType;
  originalText: string;
  suggestedText: string;
  explanation: string;
  status: SuggestionStatus;
  hasInlineHighlight?: boolean;
};

export type SuggestionFilter = {
  key: string;
  label: string;
  count: number;
};

type EditorSuggestionsPanelProps = {
  open: boolean;
  onClose?: () => void;
  onReopen: () => void;
  onOpenAIActions: () => void;
  suggestions: EditorSuggestion[];
  allSuggestions: EditorSuggestion[];
  actionRuns: AIActionRun[];
  activeRunId: string;
  onRunChange: (runId: string) => void;
  statusFilters: SuggestionFilter[];
  activeStatusFilter: string;
  onStatusFilterChange: (key: string) => void;
  typeFilters: SuggestionFilter[];
  activeTypeFilter: string;
  onTypeFilterChange: (key: string) => void;
  onApplyAllSuggestions: () => void;
  onReviewAppliedSuggestions: () => void;
  onApplySuggestion: (id: string) => void;
  pendingCount: number;
  appliedCount: number;
  onIgnoreSuggestion: (id: string) => void;
  applyingSuggestionId?: string | null;
  ignoringSuggestionId?: string | null;
  isReviewingAll?: boolean;
  isReviewingSelected?: boolean;
  activeSuggestionId?: string | null;
  onFocusSuggestion?: (id: string) => void;
};

const typeBadgeClasses: Record<SuggestionType, string> = {
  Clarity: "bg-info-muted text-info-foreground",
  Conciseness: "bg-accent-light text-accent",
  Formatting: "bg-surface-tertiary text-text-secondary",
  Grammar: "bg-error-muted text-error-foreground",
  Tone: "bg-warning-muted text-warning-foreground",
  Structure: "bg-ai-muted text-ai-dark",
};

const typeDotClasses: Record<SuggestionType, string> = {
  Clarity: "bg-info",
  Conciseness: "bg-accent",
  Formatting: "bg-text-muted",
  Grammar: "bg-error",
  Tone: "bg-warning",
  Structure: "bg-ai",
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

const actionLabels: Record<AIActionRun["action"], string> = {
  optimize: "Optimize",
  improve_clarity: "Improve Clarity",
  fix_grammar: "Fix Grammar",
  rewrite: "Rewrite",
  summarize: "Summarize",
  translate: "Translate",
  tone_analyze: "Tone Analyze",
  seo_analyze: "SEO Analyze",
  simplify_language: "Simplify Language",
};

function formatRunTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EditorSuggestionsPanel({
  open,
  onClose,
  onReopen,
  onOpenAIActions,
  suggestions,
  allSuggestions,
  actionRuns,
  activeRunId,
  onRunChange,
  statusFilters,
  activeStatusFilter,
  onStatusFilterChange,
  typeFilters,
  activeTypeFilter,
  onTypeFilterChange,
  onApplyAllSuggestions,
  onReviewAppliedSuggestions,
  onApplySuggestion,
  pendingCount,
  appliedCount,
  onIgnoreSuggestion,
  applyingSuggestionId = null,
  ignoringSuggestionId = null,
  isReviewingAll = false,
  isReviewingSelected = false,
  activeSuggestionId = null,
  onFocusSuggestion,
}: EditorSuggestionsPanelProps) {
  const hasSuggestions = suggestions.length > 0;
  const canApplyAll = pendingCount > 0;
  const canReviewApplied = appliedCount > 0;
  const runMap = new Map(actionRuns.map((run) => [run.id, run]));
  const selectedRun =
    activeRunId === "all" ? null : runMap.get(activeRunId) ?? null;
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

  return (
    <div className="flex flex-col xl:h-full xl:min-h-0">
      {open ? (
        <section className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-ai" />
              <h2 className="text-sm font-semibold text-text-primary">
                AI Suggestions
              </h2>

              <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
                {pendingCount} pending
              </span>
            </div>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
                title="Close suggestions"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </header>

          <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-border-light p-2">
            <button
              type="button"
              onClick={onOpenAIActions}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary"
            >
              AI Actions
            </button>
            <button
              type="button"
              className="rounded-md bg-accent-light px-2.5 py-1.5 text-xs font-semibold text-accent"
            >
              Suggestions ({allSuggestions.length})
            </button>
          </div>

          <div className="shrink-0 space-y-2 border-b border-border-light px-3 py-2.5">
            <label className="hidden">
              <span className="text-[11px] font-medium text-text-muted">
                AI action
              </span>
              <span className="relative">
                <select
                  value={activeRunId}
                  onChange={(event) => onRunChange(event.target.value)}
                  className="h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface py-1 pl-2.5 pr-8 text-xs font-medium text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All AI actions</option>
                  {actionRuns.map((run, index) => (
                    <option key={run.id} value={run.id}>
                      {index === 0 ? "Latest: " : ""}
                      {actionLabels[run.action]} · {formatRunTime(run.createdAt)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
              </span>
            </label>

            {selectedRun ? (
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ai-dark">
                    {actionLabels[selectedRun.action]}
                  </span>
                  <time
                    dateTime={selectedRun.createdAt}
                    className="text-[11px] text-text-muted"
                  >
                    {formatRunTime(selectedRun.createdAt)}
                  </time>
                </div>
                {selectedRun.summary ? (
                  <p className="hidden">
                    {selectedRun.summary}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="hidden">
              {statusFilters.map((filter) => {
                const isActive = filter.key === activeStatusFilter;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => onStatusFilterChange(filter.key)}
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

            {typeFilters.length > 0 ? (
              <div className="rounded-lg border border-border-light bg-surface-secondary p-2">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
                  <Highlighter className="size-3.5 text-accent" />
                  Optimization Highlights
                </div>
                <div className="flex flex-wrap gap-1.5">
                {typeFilters.map((filter) => {
                  const isActive = filter.key === activeTypeFilter;
                  const typedLabel = filter.label as SuggestionType;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() =>
                        onTypeFilterChange(isActive ? "all" : filter.key)
                      }
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? "bg-ai-muted text-ai-dark"
                          : "text-text-secondary hover:bg-surface-secondary"
                      }`}
                      title={`Show ${filter.label.toLowerCase()} highlights`}
                    >
                      <span
                        className={`mr-1.5 inline-block size-1.5 rounded-full ${
                          typeDotClasses[typedLabel] ?? "bg-text-muted"
                        }`}
                      />
                      {filter.label} {filter.count}
                    </button>
                  );
                })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto p-3 xl:min-h-0 xl:flex-1">
            {hasSuggestions ? (
              suggestions.map((suggestion, suggestionIndex) => {
                const isReviewed = suggestion.status !== "pending";
                const isApplyingThis = applyingSuggestionId === suggestion.id;
                const isIgnoringThis = ignoringSuggestionId === suggestion.id;
                const isActive = activeSuggestionId === suggestion.id;
                const isBusy =
                  isReviewingAll ||
                  isReviewingSelected ||
                  isApplyingThis ||
                  isIgnoringThis;
                const run = suggestion.aiRequestId
                  ? runMap.get(suggestion.aiRequestId)
                  : null;
                const previousSuggestion = suggestions[suggestionIndex - 1];
                const showRunHeading =
                  activeRunId === "all" &&
                  suggestion.aiRequestId !== previousSuggestion?.aiRequestId;

                return (
                  <Fragment key={suggestion.id}>
                  {showRunHeading ? (
                    <div className="flex items-center justify-between gap-2 px-1 pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        {run ? actionLabels[run.action] : "Other suggestions"}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {run ? formatRunTime(run.createdAt) : ""}
                      </span>
                    </div>
                  ) : null}
                  <article
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
                        {suggestion.status === "pending" &&
                        !suggestion.hasInlineHighlight ? (
                          <p className="mt-2 rounded-md bg-warning-muted px-2 py-1.5 text-[11px] leading-4 text-warning-foreground">
                            This suggestion no longer matches a unique range in
                            the editor. Review the text before applying it.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <LoadingButton
                        onClick={() => onApplySuggestion(suggestion.id)}
                        disabled={isReviewed || isBusy}
                        isLoading={isApplyingThis}
                        loadingText="Applying..."
                        className="h-8 px-3 py-1.5 text-xs"
                      >
                        {suggestion.status === "applied" ? "Applied" : "Apply"}
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
                  </Fragment>
                );
              })
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary p-4 text-center">
                <div>
                  <div className="mx-auto flex size-9 items-center justify-center rounded-lg bg-accent-lighter text-accent">
                    <FileText className="size-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-text-primary">
                    {allSuggestions.length > 0
                      ? "No matching suggestions"
                      : "No suggestions yet"}
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-[190px] text-xs leading-5 text-text-secondary">
                    {allSuggestions.length > 0
                      ? "Choose another AI action or adjust the active filters."
                      : "Run an AI action to generate reviewable suggestions."}
                  </p>
                  {allSuggestions.length === 0 ? (
                    <button
                      type="button"
                      onClick={onOpenAIActions}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-dark"
                    >
                      <Sparkles className="size-3.5" />
                      Choose AI Action
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {pendingCount > 0 || appliedCount > 0 ? (
            <div className="shrink-0 border-t border-border-light p-3">
              {!canApplyAll ? (
                <LoadingButton
                  onClick={onReviewAppliedSuggestions}
                  disabled={
                    !canReviewApplied ||
                    isReviewingSelected ||
                    isReviewingAll ||
                    Boolean(applyingSuggestionId) ||
                    Boolean(ignoringSuggestionId)
                  }
                  isLoading={isReviewingSelected}
                  loadingText="Opening review..."
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-dark"
                >
                  <Sparkles className="size-4" />
                  {canReviewApplied
                    ? `Review Applied Suggestions`
                    : "No Applied Suggestions"}
                </LoadingButton>
              ) : null}
              {canApplyAll ? (
                <LoadingButton
                  onClick={onApplyAllSuggestions}
                  disabled={
                    !canApplyAll ||
                    isReviewingAll ||
                    isReviewingSelected ||
                    Boolean(applyingSuggestionId) ||
                    Boolean(ignoringSuggestionId)
                  }
                  isLoading={isReviewingAll}
                  loadingText="Applying all..."
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent! bg-surface! px-4 py-2 text-sm font-semibold text-accent! hover:bg-accent-light! disabled:border-border! disabled:bg-surface! disabled:text-text-muted!"
                >
                  <Sparkles className="size-4" />
                  {`Apply All ${pendingCount} Pending`}
                </LoadingButton>
              ) : null}
              <p className="mt-2 text-center text-[11px] leading-4 text-text-muted">
                {canApplyAll
                  ? "Applies this AI action's pending suggestions without leaving the editor."
                  : "Review the applied changes in the comparison workspace."}
              </p>
            </div>
          ) : null}
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
