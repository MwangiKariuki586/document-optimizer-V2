import type { FidelityStatus } from "@/components/documents/FidelityBadge";

type EditorStatusBarProps = {
  fidelityStatus: FidelityStatus;
  healthScore?: number;
  readabilityScore?: number;
  seoScore?: number;
  text: string;
  wordCount: number;
  pendingSuggestionCount: number;
  appliedSuggestionCount: number;
};

type MetricPillProps = {
  label: string;
  value: number;
};

const healthScoreByFidelity: Record<FidelityStatus, number> = {
  "Structure Preserved": 86,
  "Original Preserved": 84,
  "Limited Formatting": 64,
  "Plain Text Only": 58,
  "Formatting Review Needed": 62,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countSentences(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return matches?.filter((sentence) => sentence.trim().length > 0).length ?? 0;
}

function getWords(text: string): string[] {
  return text.match(/\b[\p{L}\p{N}'-]+\b/gu) ?? [];
}

export function estimateReadabilityScore(text: string, wordCount: number): number {
  if (wordCount === 0) {
    return 0;
  }

  const words = getWords(text);
  const sentenceCount = Math.max(1, countSentences(text));
  const avgSentenceLength = wordCount / sentenceCount;
  const longWordRatio =
    words.filter((word) => word.replace(/[^a-z0-9]/giu, "").length >= 10)
      .length / Math.max(1, words.length);
  const paragraphs = text
    .split(/\n{2,}/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const avgParagraphWords =
    paragraphs.reduce((sum, paragraph) => sum + getWords(paragraph).length, 0) /
    Math.max(1, paragraphs.length);

  let score = 92;

  if (avgSentenceLength > 28) score -= 18;
  else if (avgSentenceLength > 22) score -= 12;
  else if (avgSentenceLength > 17) score -= 6;

  if (longWordRatio > 0.22) score -= 12;
  else if (longWordRatio > 0.16) score -= 7;
  else if (longWordRatio > 0.1) score -= 3;

  if (avgParagraphWords > 140) score -= 12;
  else if (avgParagraphWords > 90) score -= 7;

  if (wordCount < 80) score -= 8;

  return clampScore(score);
}

export function estimateSeoScore(text: string, wordCount: number): number {
  if (wordCount === 0) {
    return 0;
  }

  const lines = text
    .split(/\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const headingCount = lines.filter(
    (line) =>
      line.startsWith("#") ||
      (/^[A-Z][A-Z0-9 &/-]{2,}$/u.test(line) && line.length <= 80),
  ).length;
  const bulletCount = lines.filter((line) => /^[-*\u2022]\s+/u.test(line)).length;
  const hasLinks = /https?:\/\/|www\./iu.test(text);
  const hasReadableLength = wordCount >= 120 && wordCount <= 1800;
  const uniqueWordRatio =
    new Set(getWords(text).map((word) => word.toLowerCase())).size /
    Math.max(1, wordCount);

  let score = 54;

  if (hasReadableLength) score += 12;
  else if (wordCount >= 80) score += 6;

  score += Math.min(18, headingCount * 6);
  score += Math.min(10, bulletCount * 2);
  if (hasLinks) score += 6;
  if (uniqueWordRatio > 0.45) score += 8;
  else if (uniqueWordRatio > 0.32) score += 4;

  return clampScore(score);
}

export function estimateHealthScore(input: {
  fidelityStatus: FidelityStatus;
  readabilityScore: number;
  seoScore: number;
  pendingSuggestionCount: number;
  appliedSuggestionCount: number;
}): number {
  const fidelityScore = healthScoreByFidelity[input.fidelityStatus];
  const pendingPenalty = Math.min(18, input.pendingSuggestionCount * 3);
  const appliedBonus = Math.min(6, input.appliedSuggestionCount * 1.5);

  return clampScore(
    fidelityScore * 0.45 +
      input.readabilityScore * 0.35 +
      input.seoScore * 0.2 -
      pendingPenalty +
      appliedBonus,
  );
}

function getScoreClass(value: number): string {
  if (value >= 80) {
    return "bg-success-muted text-success-foreground";
  }

  if (value >= 65) {
    return "bg-warning-muted text-warning-foreground";
  }

  return "bg-error-muted text-error-foreground";
}

function MetricPill({ label, value }: MetricPillProps) {
  return (
    <div className="inline-flex min-w-0 shrink-0 items-center gap-1 rounded-full border border-border-light bg-surface px-2 py-1 shadow-card-soft sm:gap-2 sm:px-3 sm:py-1.5">
      <span className="truncate text-xs font-medium text-text-secondary">
        {label}
      </span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs font-bold sm:px-2 ${getScoreClass(value)}`}
      >
        {value}%
      </span>
    </div>
  );
}

export function EditorStatusBar({
  fidelityStatus,
  healthScore,
  readabilityScore,
  seoScore,
  text,
  wordCount,
  pendingSuggestionCount,
  appliedSuggestionCount,
}: EditorStatusBarProps) {
  const resolvedReadabilityScore =
    readabilityScore ?? estimateReadabilityScore(text, wordCount);
  const resolvedSeoScore = seoScore ?? estimateSeoScore(text, wordCount);
  const resolvedHealthScore =
    healthScore ??
    estimateHealthScore({
      fidelityStatus,
      readabilityScore: resolvedReadabilityScore,
      seoScore: resolvedSeoScore,
      pendingSuggestionCount,
      appliedSuggestionCount,
    });

  return (
    <section className="scrollbar-hidden w-full min-w-0 shrink-0 overflow-x-auto rounded-xl px-1 py-1.5 sm:px-3 sm:py-2">
      <div className="flex w-max min-w-full items-center justify-center gap-2">
        <MetricPill label="Health" value={resolvedHealthScore} />
        <MetricPill label="Readability" value={resolvedReadabilityScore} />
        <MetricPill label="SEO" value={resolvedSeoScore} />
      </div>
    </section>
  );
}
