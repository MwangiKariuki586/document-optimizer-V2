"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe,
  Languages,
  MessageSquareText,
  PenLine,
  Search,
  Sparkles,
  Type,
  Wand2,
  X,
} from "lucide-react";

import { InlineAlert } from "@/components/feedback/InlineAlert";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import type { AIActionKey, AIActionOptions } from "@/lib/ai/ai.types";

export type AIActionSettings = AIActionOptions;

export type AIActionStatus = "idle" | "processing" | "ready" | "error";

type AIActionDefinition = {
  key: AIActionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  accentClass: string;
};

type AIActionsPanelProps = {
  onBack: () => void;
  onClose?: () => void;
  onRunAction: (input: {
    action: AIActionKey;
    options: AIActionSettings;
  }) => Promise<{ id: string; summary: string; previewHref: string }>;
};

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "confident", label: "Confident" },
  { value: "formal", label: "Formal" },
] satisfies Array<{ value: AIActionOptions["tone"]; label: string }>;

const AUDIENCE_OPTIONS = [
  { value: "general", label: "General audience" },
  { value: "executive", label: "Executive readers" },
  { value: "technical", label: "Technical readers" },
  { value: "customer", label: "Customers" },
] satisfies Array<{ value: AIActionOptions["audience"]; label: string }>;

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
] satisfies Array<{ value: AIActionOptions["language"]; label: string }>;

const AI_ACTIONS: AIActionDefinition[] = [
  {
    key: "optimize",
    label: "Optimize",
    description: "Improve clarity, tone, and structure in one pass.",
    icon: Wand2,
    accentClass: "bg-ai-muted text-ai-dark",
  },
  {
    key: "improve_clarity",
    label: "Improve Clarity",
    description: "Simplify complex sentences and sharpen meaning.",
    icon: MessageSquareText,
    accentClass: "bg-info-muted text-info-foreground",
  },
  {
    key: "fix_grammar",
    label: "Fix Grammar",
    description: "Correct grammar, spelling, and punctuation.",
    icon: PenLine,
    accentClass: "bg-success-muted text-success-foreground",
  },
  {
    key: "rewrite",
    label: "Rewrite",
    description: "Refresh wording while keeping the same intent.",
    icon: Type,
    accentClass: "bg-accent-light text-accent",
  },
  {
    key: "summarize",
    label: "Summarize",
    description: "Create a concise summary of the document.",
    icon: FileText,
    accentClass: "bg-surface-tertiary text-text-secondary",
  },
  {
    key: "translate",
    label: "Translate",
    description: "Translate content into the selected language.",
    icon: Languages,
    accentClass: "bg-info-muted text-info-foreground",
  },
  {
    key: "tone_analyze",
    label: "Tone Analyze",
    description: "Review tone and suggest more consistent phrasing.",
    icon: Sparkles,
    accentClass: "bg-ai-muted text-ai-dark",
  },
  {
    key: "seo_analyze",
    label: "SEO Analyze",
    description: "Check keyword usage and search relevance.",
    icon: Search,
    accentClass: "bg-warning-muted text-warning-foreground",
  },
  {
    key: "simplify_language",
    label: "Simplify Language",
    description: "Make the document easier to read and understand.",
    icon: Globe,
    accentClass: "bg-success-muted text-success-foreground",
  },
];

const selectClass =
  "h-8 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-text-secondary transition hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent";

export function AIActionsPanel({
  onBack,
  onClose,
  onRunAction,
}: AIActionsPanelProps) {
  const [selectedAction, setSelectedAction] = useState<AIActionKey>("optimize");
  const [settings, setSettings] = useState<AIActionSettings>({
    tone: "professional",
    audience: "general",
    language: "en",
    preserveStructure: true,
  });
  const [status, setStatus] = useState<AIActionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readyResult, setReadyResult] = useState<{
    id: string;
    summary: string;
    previewHref: string;
  } | null>(null);

  const selectedActionDef = AI_ACTIONS.find((action) => action.key === selectedAction);
  const isProcessing = status === "processing";
  const isDisabled = isProcessing;

  const handleRunAction = async () => {
    if (isProcessing) {
      return;
    }

    setStatus("processing");
    setErrorMessage(null);
    setReadyResult(null);

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
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage(null);
    setReadyResult(null);
  };

  const handleSelectAction = (key: AIActionKey) => {
    if (isProcessing) {
      return;
    }

    setSelectedAction(key);
    setStatus("idle");
    setErrorMessage(null);
    setReadyResult(null);
  };

  return (
    <div className="flex flex-col xl:h-full xl:min-h-0">
      <section className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light p-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
              title="Back to suggestions"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0 text-ai" />
                <h2 className="truncate text-sm font-semibold text-text-primary">
                  AI Assistant
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-text-muted">
                Preview-first. Nothing changes until you apply.
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

        <div className="flex shrink-0 flex-col gap-2 border-b border-border-light bg-ai-muted/40 p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-ai-light text-ai-dark">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ai-dark">AI Summary</p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Choose an action to improve your document. Results open as a
                preview before anything is applied.
              </p>
            </div>
          </div>
        </div>

        {status === "error" && errorMessage ? (
          <div className="shrink-0 border-b border-border-light p-3">
            <InlineAlert title="AI action failed" variant="error">
              {errorMessage}
            </InlineAlert>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 text-xs font-medium text-accent transition hover:text-accent-dark"
            >
              Try again
            </button>
          </div>
        ) : null}

        {status === "ready" && selectedActionDef && readyResult ? (
          <div className="shrink-0 border-b border-border-light bg-success-muted/50 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <div>
                <p className="text-xs font-semibold text-success-foreground">
                  Result ready for review
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  {readyResult.summary}
                </p>
                <p className="mt-1 text-[11px] leading-4 text-text-muted">
                  Request {readyResult.id.slice(0, 8)} saved. Full preview and
                  apply controls arrive in the next phase.
                </p>
                <Link
                  href={readyResult.previewHref}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent bg-surface px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-light"
                >
                  View preview
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex shrink-0 flex-col gap-2 border-b border-border-light p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Action settings
          </p>
          <div className="grid gap-2">
            <label className="grid gap-1">
              <span className="text-[11px] font-medium text-text-muted">Tone</span>
              <select
                className={selectClass}
                value={settings.tone}
                disabled={isDisabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    tone: event.target.value as AIActionOptions["tone"],
                  }))
                }
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-medium text-text-muted">
                Audience
              </span>
              <select
                className={selectClass}
                value={settings.audience}
                disabled={isDisabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    audience: event.target.value as AIActionOptions["audience"],
                  }))
                }
              >
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-medium text-text-muted">
                Language
              </span>
              <select
                className={selectClass}
                value={settings.language}
                disabled={isDisabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    language: event.target.value as AIActionOptions["language"],
                  }))
                }
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-border-light bg-surface-secondary px-3 py-2">
              <span className="text-xs font-medium text-text-secondary">
                Preserve structure
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.preserveStructure}
                disabled={isDisabled}
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    preserveStructure: !current.preserveStructure,
                  }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                  settings.preserveStructure ? "bg-accent" : "bg-border-strong"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span
                  className={`inline-block size-4 rounded-full bg-surface shadow-card-soft transition ${
                    settings.preserveStructure ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        <div className="flex min-h-0 flex-col xl:flex-1">
          <div className="shrink-0 border-b border-border-light px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Choose an action
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
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-ai bg-ai-muted shadow-card-soft"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-secondary"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${action.accentClass}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-text-primary">
                      {action.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-text-secondary">
                      {action.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-border-light p-3">
          <LoadingButton
            className="h-9 w-full text-xs font-semibold"
            isLoading={isProcessing}
            loadingText="Running AI action…"
            disabled={isDisabled && !isProcessing}
            onClick={handleRunAction}
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4" />
              Run {selectedActionDef?.label ?? "Action"}
            </span>
          </LoadingButton>
          <p className="mt-2 text-center text-[11px] leading-4 text-text-muted">
            AI output opens as a preview. Your document stays unchanged until
            you apply it.
          </p>
        </div>
      </section>
    </div>
  );
}
