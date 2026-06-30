"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ChevronDown,
  FileText,
  Languages,
  ListChecks,
  MessageSquareText,
  PenLine,
  Rows3,
  Sparkles,
  X,
} from "lucide-react";

import { InlineAlert } from "@/components/feedback/InlineAlert";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import type { AIActionKey, AIActionOptions } from "@/lib/ai/ai.types";

export type AIActionSettings = AIActionOptions;

export type AIActionStatus = "idle" | "processing" | "ready" | "error";

type ActionWorkflow = "inline_suggestions" | "result_preview";

type AIActionDefinition = {
  key: AIActionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
  workflow: ActionWorkflow;
};

type AIActionsPanelProps = {
  onShowSuggestions: () => void;
  suggestionCount: number;
  onClose?: () => void;
  onRunAction: (input: {
    action: AIActionKey;
    options: AIActionSettings;
  }) => Promise<{
    id: string;
    summary: string;
    previewHref: string;
    workflow: ActionWorkflow;
    suggestionCount: number;
    resultMode?: "optimization" | "summary" | "translation";
  }>;
};

const TONE_TARGET_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
  { value: "concise", label: "Concise" },
  { value: "persuasive", label: "Persuasive" },
] satisfies Array<{ value: AIActionOptions["toneTarget"]; label: string }>;

const SUMMARY_OUTPUT_OPTIONS = [
  { value: "short_summary", label: "Short summary" },
  { value: "bullet_summary", label: "Bullet summary" },
  { value: "executive_summary", label: "Executive summary" },
  { value: "shortened_version", label: "Shortened version" },
] satisfies Array<{ value: AIActionOptions["summaryOutputType"]; label: string }>;

const SUMMARY_LENGTH_OPTIONS = [
  { value: "brief", label: "Brief" },
  { value: "medium", label: "Medium" },
  { value: "detailed", label: "Detailed" },
] satisfies Array<{ value: AIActionOptions["summaryLength"]; label: string }>;

const TRANSLATION_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "sw", label: "Swahili" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "zh-CN", label: "Chinese Simplified" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "tr", label: "Turkish" },
  { value: "ru", label: "Russian" },
  { value: "pl", label: "Polish" },
  { value: "uk", label: "Ukrainian" },
  { value: "id", label: "Indonesian" },
  { value: "ms", label: "Malay" },
  { value: "vi", label: "Vietnamese" },
  { value: "th", label: "Thai" },
  { value: "fil", label: "Filipino / Tagalog" },
] satisfies Array<{ value: AIActionOptions["targetLanguage"]; label: string }>;

const TRANSLATION_STYLE_OPTIONS = [
  { value: "natural", label: "Natural" },
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "simple", label: "Simple" },
] satisfies Array<{ value: AIActionOptions["translationStyle"]; label: string }>;

const AI_ACTIONS: AIActionDefinition[] = [
  {
    key: "improvement_scan",
    label: "Improvement Scan",
    description:
      "Highlight opportunities across clarity, grammar, tone, structure, and formatting.",
    icon: Sparkles,
    accentClass: "bg-ai-muted text-ai-dark",
    workflow: "inline_suggestions",
  },
  {
    key: "proofread_correct",
    label: "Proofread & Correct",
    description: "Correct grammar, spelling, punctuation, and typos.",
    icon: PenLine,
    accentClass: "bg-success-muted text-success-foreground",
    workflow: "inline_suggestions",
  },
  {
    key: "improve_readability",
    label: "Improve Readability",
    description: "Make complex sentences easier to read while preserving meaning.",
    icon: MessageSquareText,
    accentClass: "bg-info-muted text-info-foreground",
    workflow: "inline_suggestions",
  },
  {
    key: "tone_alignment",
    label: "Tone Alignment",
    description: "Adjust the writing style to match the intended audience and purpose.",
    icon: AlignLeft,
    accentClass: "bg-warning-muted text-warning-foreground",
    workflow: "inline_suggestions",
  },
  {
    key: "structure_flow",
    label: "Structure & Flow",
    description:
      "Improve headings, section order, paragraph flow, and logical progression.",
    icon: Rows3,
    accentClass: "bg-accent-light text-accent",
    workflow: "inline_suggestions",
  },
  {
    key: "summarize_shorten",
    label: "Summarize & Shorten",
    description: "Create a concise version or summary of the document.",
    icon: FileText,
    accentClass: "bg-surface-tertiary text-text-secondary",
    workflow: "result_preview",
  },
  {
    key: "translate_document",
    label: "Translate Document",
    description:
      "Create a translated version in another language while preserving the original.",
    icon: Languages,
    accentClass: "bg-info-muted text-info-foreground",
    workflow: "result_preview",
  },
];

const selectClass =
  "h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface py-1 pl-2.5 pr-8 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent";

const textInputClass =
  "h-8 w-full rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-accent";

const AI_PROGRESS_STAGES = [
  { delay: 0, message: "Preparing your document..." },
  { delay: 1200, message: "Working through the content..." },
  { delay: 4500, message: "Checking generated suggestions..." },
  { delay: 7500, message: "Finalizing your result..." },
] as const;

function getOptionLabel<T extends string | undefined>(
  options: Array<{ value: T; label: string }>,
  value: T,
  fallback: string,
) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function AIActionsPanel({
  onShowSuggestions,
  suggestionCount,
  onClose,
  onRunAction,
}: AIActionsPanelProps) {
  const [selectedAction, setSelectedAction] =
    useState<AIActionKey>("improvement_scan");
  const [settings, setSettings] = useState<AIActionSettings>({
    tone: "professional",
    audience: "general",
    language: "en",
    preserveStructure: true,
    toneTarget: "professional",
    summaryOutputType: "short_summary",
    summaryLength: "medium",
    targetLanguage: "sw",
    translationStyle: "natural",
  });
  const [languageQuery, setLanguageQuery] = useState("");
  const [status, setStatus] = useState<AIActionStatus>("idle");
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [progressMessage, setProgressMessage] = useState<string>(
    AI_PROGRESS_STAGES[0].message,
  );
  const progressTimers = useRef<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readyResult, setReadyResult] = useState<{
    id: string;
    summary: string;
    previewHref: string;
    workflow: ActionWorkflow;
    suggestionCount: number;
    resultMode?: "optimization" | "summary" | "translation";
  } | null>(null);

  const selectedActionDef =
    AI_ACTIONS.find((action) => action.key === selectedAction) ?? AI_ACTIONS[0];
  const isProcessing = status === "processing";
  const isDisabled = isProcessing;
  const hasSetupControls =
    selectedAction === "tone_alignment" ||
    selectedAction === "summarize_shorten" ||
    selectedAction === "translate_document";
  const filteredLanguages = useMemo(() => {
    const query = languageQuery.trim().toLowerCase();

    if (!query) {
      return TRANSLATION_LANGUAGE_OPTIONS;
    }

    return TRANSLATION_LANGUAGE_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [languageQuery]);

  const clearProgressTimers = () => {
    progressTimers.current.forEach((timer) => window.clearTimeout(timer));
    progressTimers.current = [];
  };

  const startProgressMessages = () => {
    clearProgressTimers();
    setProgressMessage(AI_PROGRESS_STAGES[0].message);
    progressTimers.current = AI_PROGRESS_STAGES.slice(1).map((stage) =>
      window.setTimeout(() => setProgressMessage(stage.message), stage.delay),
    );
  };

  useEffect(
    () => () => {
      progressTimers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const handleRunAction = async () => {
    if (isProcessing) {
      return;
    }

    setStatus("processing");
    setSettingsExpanded(false);
    setErrorMessage(null);
    setReadyResult(null);
    startProgressMessages();

    try {
      const result = await onRunAction({
        action: selectedAction,
        options: settings,
      });
      setReadyResult(result);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not complete this AI action right now. Try again.",
      );
    } finally {
      clearProgressTimers();
    }
  };

  const handleRetry = () => {
    void handleRunAction();
  };

  const handleSelectAction = (key: AIActionKey) => {
    if (isProcessing) {
      return;
    }

    setSelectedAction(key);
    setSettingsExpanded(true);
    clearProgressTimers();
    setStatus("idle");
    setErrorMessage(null);
    setReadyResult(null);
  };

  const setupSummary =
    selectedAction === "tone_alignment"
      ? `${getOptionLabel(
          TONE_TARGET_OPTIONS,
          settings.toneTarget,
          "Professional",
        )} tone`
      : selectedAction === "summarize_shorten"
        ? `${getOptionLabel(
            SUMMARY_OUTPUT_OPTIONS,
            settings.summaryOutputType,
            "Short summary",
          )} - ${getOptionLabel(
            SUMMARY_LENGTH_OPTIONS,
            settings.summaryLength,
            "Medium",
          )}`
        : selectedAction === "translate_document"
          ? `${getOptionLabel(
              TRANSLATION_LANGUAGE_OPTIONS,
              settings.targetLanguage,
              "Swahili",
            )} - ${getOptionLabel(
              TRANSLATION_STYLE_OPTIONS,
              settings.translationStyle,
              "Natural",
            )}`
          : selectedActionDef.workflow === "result_preview"
            ? "Opens in Results"
            : "Creates inline highlights";

  return (
    <div className="flex flex-col xl:h-full xl:min-h-0">
      <section className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-ai" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-text-primary">
                AI Actions
              </h2>
              <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
                Choose the outcome before AI runs.
              </p>
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              title="Close panel"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </header>

        <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-border-light p-2">
          <button
            type="button"
            className="rounded-md bg-accent-light px-2.5 py-1.5 text-xs font-semibold text-accent"
          >
            AI Actions
          </button>
          <button
            type="button"
            onClick={onShowSuggestions}
            disabled={isProcessing}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Suggestions {suggestionCount > 0 ? `(${suggestionCount})` : ""}
          </button>
        </div>

        {status === "error" && errorMessage ? (
          <div className="shrink-0 border-b border-border-light p-3">
            <InlineAlert title="AI action failed" variant="error">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-3 inline-flex items-center justify-center rounded-md border border-error-light bg-surface px-3 py-1.5 text-xs font-semibold text-error-foreground transition hover:bg-error-light"
              >
                Try again
              </button>
            </InlineAlert>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-col xl:flex-1">
          <div className="shrink-0 border-b border-border-light px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Default actions
            </p>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-3 xl:min-h-0 xl:flex-1">
            {AI_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.key;

              return (
                <button
                  key={action.key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectAction(action.key)}
                  title={action.description}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-ai bg-ai-muted shadow-card-soft"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-secondary"
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${action.accentClass}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-text-primary">
                      {action.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-text-secondary">
                      {action.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-border-light p-3">
          <div className="mb-3 rounded-lg border border-border-light bg-surface-secondary p-2.5">
            <button
              type="button"
              disabled={isDisabled || !hasSetupControls}
              onClick={() => setSettingsExpanded((current) => !current)}
              className="flex w-full items-center justify-between gap-2 text-left disabled:cursor-default"
              aria-expanded={settingsExpanded}
            >
              <span className="flex min-w-0 items-center gap-2">
                <ListChecks className="size-4 shrink-0 text-text-muted" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-text-primary">
                    {selectedActionDef.label}
                  </span>
                  <span className="block truncate text-[11px] leading-4 text-text-muted">
                    {setupSummary}
                  </span>
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {selectedActionDef.workflow === "result_preview"
                  ? "Results"
                  : "Inline"}
              </span>
              {hasSetupControls ? (
                <ChevronDown
                  className={`size-3.5 shrink-0 text-text-muted transition ${
                    settingsExpanded ? "rotate-180" : ""
                  }`}
                />
              ) : null}
            </button>

            {settingsExpanded && selectedAction === "tone_alignment" ? (
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Target tone
                  </span>
                  <span className="relative">
                    <select
                      className={selectClass}
                      value={settings.toneTarget}
                      disabled={isDisabled}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          toneTarget: event.target
                            .value as AIActionOptions["toneTarget"],
                          tone: event.target.value as AIActionOptions["tone"],
                        }))
                      }
                    >
                      {TONE_TARGET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  </span>
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Audience or purpose
                  </span>
                  <input
                    className={textInputClass}
                    value={settings.audienceOrPurpose ?? ""}
                    disabled={isDisabled}
                    placeholder="Hiring manager, client proposal, internal memo"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        audienceOrPurpose: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}

            {settingsExpanded && selectedAction === "summarize_shorten" ? (
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Output type
                  </span>
                  <span className="relative">
                    <select
                      className={selectClass}
                      value={settings.summaryOutputType}
                      disabled={isDisabled}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          summaryOutputType: event.target
                            .value as AIActionOptions["summaryOutputType"],
                        }))
                      }
                    >
                      {SUMMARY_OUTPUT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  </span>
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Target length
                  </span>
                  <span className="relative">
                    <select
                      className={selectClass}
                      value={settings.summaryLength}
                      disabled={isDisabled}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          summaryLength: event.target
                            .value as AIActionOptions["summaryLength"],
                        }))
                      }
                    >
                      {SUMMARY_LENGTH_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  </span>
                </label>
              </div>
            ) : null}

            {settingsExpanded && selectedAction === "translate_document" ? (
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Find language
                  </span>
                  <input
                    className={textInputClass}
                    value={languageQuery}
                    disabled={isDisabled}
                    placeholder="Search supported languages"
                    onChange={(event) => setLanguageQuery(event.target.value)}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Target language
                  </span>
                  <span className="relative">
                    <select
                      className={selectClass}
                      value={settings.targetLanguage}
                      disabled={isDisabled}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          targetLanguage: event.target
                            .value as AIActionOptions["targetLanguage"],
                        }))
                      }
                    >
                      {filteredLanguages.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  </span>
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Translation style
                  </span>
                  <span className="relative">
                    <select
                      className={selectClass}
                      value={settings.translationStyle}
                      disabled={isDisabled}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          translationStyle: event.target
                            .value as AIActionOptions["translationStyle"],
                        }))
                      }
                    >
                      {TRANSLATION_STYLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  </span>
                </label>
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-text-muted">
                    Terms to preserve
                  </span>
                  <input
                    className={textInputClass}
                    value={settings.termsToPreserve ?? ""}
                    disabled={isDisabled}
                    placeholder="Names, product terms, acronyms"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        termsToPreserve: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}
          </div>

          {status === "ready" && readyResult?.workflow === "result_preview" ? (
            <Link
              href={readyResult.previewHref}
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent-dark"
            >
              <FileText className="size-4" />
              View result
            </Link>
          ) : status === "ready" &&
            readyResult?.workflow === "inline_suggestions" &&
            readyResult.suggestionCount > 0 ? (
            <LoadingButton
              className="h-9 w-full text-xs font-semibold"
              isLoading={false}
              onClick={onShowSuggestions}
            >
              <span className="inline-flex items-center gap-2">
                <ListChecks className="size-4" />
                Review suggestions
              </span>
            </LoadingButton>
          ) : status === "ready" && readyResult?.workflow === "inline_suggestions" ? (
            <LoadingButton
              className="h-9 w-full text-xs font-semibold"
              isLoading={false}
              onClick={handleRunAction}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                Run {selectedActionDef.label} again
              </span>
            </LoadingButton>
          ) : (
            <LoadingButton
              className="h-9 w-full text-xs font-semibold"
              isLoading={isProcessing}
              loadingText={progressMessage}
              disabled={isDisabled && !isProcessing}
              onClick={handleRunAction}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4" />
                Run {selectedActionDef.label}
              </span>
            </LoadingButton>
          )}
          <p className="mt-2 text-center text-[11px] leading-4 text-text-muted">
            {status === "ready" &&
            readyResult?.workflow === "inline_suggestions" &&
            readyResult.suggestionCount === 0
              ? "No reviewable suggestions were found for that run."
              : selectedActionDef.workflow === "result_preview"
              ? "Opens in Results. The original document stays unchanged."
              : "Creates reviewable highlights in the editor."}
          </p>
        </div>
      </section>
    </div>
  );
}
