export type ReplacementSafety = "safe" | "missing" | "ambiguous";

export class SuggestionReplacementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SuggestionReplacementError";
  }
}

export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) {
    return 0;
  }

  let count = 0;
  let position = 0;

  while ((position = haystack.indexOf(needle, position)) !== -1) {
    count += 1;
    position += needle.length;
  }

  return count;
}

export function getReplacementSafety(
  markdown: string,
  originalText: string,
): ReplacementSafety {
  const occurrences = countOccurrences(markdown, originalText);

  if (occurrences === 0) {
    return "missing";
  }

  if (occurrences > 1) {
    return "ambiguous";
  }

  return "safe";
}

function isWhitespace(value: string): boolean {
  return /\s/u.test(value);
}

function normalizeWhitespaceWithOffsets(value: string) {
  let normalized = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let index = 0;

  while (index < value.length) {
    if (isWhitespace(value[index])) {
      const start = index;

      while (index < value.length && isWhitespace(value[index])) {
        index += 1;
      }

      normalized += " ";
      starts.push(start);
      ends.push(index);
      continue;
    }

    normalized += value[index];
    starts.push(index);
    index += 1;
    ends.push(index);
  }

  return { normalized, starts, ends };
}

export function resolveSuggestionOriginalText(
  markdown: string,
  originalText: string,
): string | null {
  if (getReplacementSafety(markdown, originalText) === "safe") {
    return originalText;
  }

  const normalizedNeedle = originalText.trim().replace(/\s+/gu, " ");

  if (!normalizedNeedle) {
    return null;
  }

  const normalizedMarkdown = normalizeWhitespaceWithOffsets(markdown);
  const firstMatch = normalizedMarkdown.normalized.indexOf(normalizedNeedle);

  if (firstMatch === -1) {
    return null;
  }

  if (
    normalizedMarkdown.normalized.indexOf(
      normalizedNeedle,
      firstMatch + normalizedNeedle.length,
    ) !== -1
  ) {
    return null;
  }

  const start = normalizedMarkdown.starts[firstMatch];
  const end =
    normalizedMarkdown.ends[firstMatch + normalizedNeedle.length - 1];

  if (start === undefined || end === undefined) {
    return null;
  }

  const resolved = markdown.slice(start, end);

  return getReplacementSafety(markdown, resolved) === "safe" ? resolved : null;
}

export function resolveSuggestionOriginalTextFromLocation(
  markdown: string,
  location?: {
    startOffset?: number;
    endOffset?: number;
  },
): string | null {
  if (
    !location ||
    location.startOffset === undefined ||
    location.endOffset === undefined ||
    !Number.isInteger(location.startOffset) ||
    !Number.isInteger(location.endOffset) ||
    location.startOffset < 0 ||
    location.endOffset <= location.startOffset ||
    location.endOffset > markdown.length
  ) {
    return null;
  }

  const resolved = markdown.slice(location.startOffset, location.endOffset);

  if (!resolved.trim()) {
    return null;
  }

  return getReplacementSafety(markdown, resolved) === "safe" ? resolved : null;
}

export function resolveSuggestionOriginalTextFromCandidates(
  markdownCandidates: Array<string | null | undefined>,
  originalText: string,
  location?: {
    startOffset?: number;
    endOffset?: number;
  },
): string | null {
  const uniqueCandidates = Array.from(
    new Set(
      markdownCandidates
        .map((markdown) => markdown?.trim())
        .filter((markdown): markdown is string => Boolean(markdown)),
    ),
  );

  return (
    uniqueCandidates
      .map(
        (markdown) =>
          resolveSuggestionOriginalText(markdown, originalText) ??
          resolveSuggestionOriginalTextFromLocation(markdown, location),
      )
      .find((resolved): resolved is string => Boolean(resolved)) ?? null
  );
}

export function replaceOnce(
  markdown: string,
  originalText: string,
  suggestedText: string,
): string {
  const safety = getReplacementSafety(markdown, originalText);

  if (safety === "missing") {
    throw new SuggestionReplacementError(
      "This suggestion no longer matches the document. Review it individually or regenerate suggestions.",
    );
  }

  if (safety === "ambiguous") {
    throw new SuggestionReplacementError(
      "This suggestion matches multiple places in the document. Apply it individually after reviewing the text.",
    );
  }

  const index = markdown.indexOf(originalText);

  return (
    markdown.slice(0, index) +
    suggestedText +
    markdown.slice(index + originalText.length)
  );
}

type ReplacementPair = {
  originalText: string;
  suggestedText: string;
};

export function applyReplacementsSafely(
  markdown: string,
  replacements: ReplacementPair[],
): string {
  if (replacements.length === 0) {
    return markdown;
  }

  for (const replacement of replacements) {
    const safety = getReplacementSafety(markdown, replacement.originalText);

    if (safety !== "safe") {
      throw new SuggestionReplacementError(
        safety === "missing"
          ? "One or more suggestions no longer match the document. Apply suggestions individually."
          : "One or more suggestions match multiple places in the document. Apply suggestions individually.",
      );
    }
  }

  const sorted = [...replacements].sort(
    (left, right) =>
      markdown.lastIndexOf(right.originalText) -
      markdown.lastIndexOf(left.originalText),
  );

  let result = markdown;

  for (const replacement of sorted) {
    result = replaceOnce(
      result,
      replacement.originalText,
      replacement.suggestedText,
    );
  }

  return result;
}
