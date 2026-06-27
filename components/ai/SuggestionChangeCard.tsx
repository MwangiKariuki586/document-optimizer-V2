"use client";

import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import type { ChangeSummaryType } from "@/components/ai/ChangeSummary";

export const suggestionChangeTypeLabels: Record<ChangeSummaryType, string> = {
  clarity: "Clarity",
  conciseness: "Conciseness",
  formatting: "Formatting",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
};

export const suggestionChangeTypeBadgeClasses: Record<
  ChangeSummaryType,
  string
> = {
  clarity: "bg-info-muted text-info-foreground",
  conciseness: "bg-accent-light text-accent",
  formatting: "bg-surface-tertiary text-text-secondary",
  grammar: "bg-error-muted text-error-foreground",
  tone: "bg-warning-muted text-warning-foreground",
  structure: "bg-ai-muted text-ai-dark",
};

type SuggestionChangeCardMode = "preview-review";

type SuggestionChangeCardProps = {
  change: PreviewChangeAnchor;
  active: boolean;
  mode?: SuggestionChangeCardMode;
  onSelect: (changeId: string) => void;
};

function normalizeSnippet(value: string, fallback = "No snippet available") {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized || fallback;
}

function truncateSnippet(value: string, limit: number): string {
  const normalized = normalizeSnippet(value);

  return normalized.length > limit
    ? `${normalized.slice(0, Math.max(0, limit - 3))}...`
    : normalized;
}

function getPreviewPhrase(value: string): string {
  const normalized = normalizeSnippet(value);
  const words = normalized.split(" ").filter(Boolean);

  return words.slice(0, 3).join(" ");
}

export function SuggestionChangeCard({
  change,
  active,
  mode = "preview-review",
  onSelect,
}: SuggestionChangeCardProps) {
  const currentSnippet = normalizeSnippet(change.originalText);
  const proposedSnippet = normalizeSnippet(change.suggestedText);
  const explanation = normalizeSnippet(
    change.explanation ?? "",
    "Included in the proposed result.",
  );

  if (mode !== "preview-review") {
    return null;
  }

  return (
    <article
      className={`box-border w-full min-w-0 max-w-full rounded-xl border p-3 transition ${
        active
          ? "border-accent bg-accent-muted shadow-card-soft"
          : "border-border-light bg-surface hover:border-border-strong"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(change.id)}
        className="flex w-full min-w-0 items-start gap-2 text-left focus:outline-none focus-visible:outline-none"
      >
        <span className="flex min-w-0 flex-1 gap-2">
          <span className="min-w-0 max-w-full">
            <span className="block break-words text-xs font-semibold leading-5 text-text-primary">
              {change.label}
            </span>
            <span className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${suggestionChangeTypeBadgeClasses[change.type]}`}
              >
                {suggestionChangeTypeLabels[change.type]}
              </span>
              <span className="min-w-0 text-[11px] leading-4 text-text-muted">
                <span className="text-error-foreground">
                  {truncateSnippet(getPreviewPhrase(currentSnippet), 26)}
                </span>{" "}
                <span aria-hidden="true">→</span>{" "}
                <span className="text-success-foreground">
                  {truncateSnippet(getPreviewPhrase(proposedSnippet), 26)}
                </span>
              </span>
            </span>
          </span>
        </span>
      </button>

      <p className="mt-2 break-words text-xs leading-5 text-text-secondary">
        {truncateSnippet(explanation, 118)}
      </p>
    </article>
  );
}
