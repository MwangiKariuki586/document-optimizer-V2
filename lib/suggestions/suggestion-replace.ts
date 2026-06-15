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
