import { describe, expect, it } from "vitest";

import {
  buildAppliedSuggestionSummary,
  buildAppliedSuggestionsReviewPreview,
  getAISuggestionCandidateRejectionReason,
} from "@/lib/suggestions/suggestions.service";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";

function suggestion(
  input: Partial<DocumentSuggestion> &
    Pick<DocumentSuggestion, "id" | "originalText" | "suggestedText">,
): DocumentSuggestion {
  return {
    documentId: "doc-1",
    aiRequestId: "request-1",
    type: "clarity",
    explanation: "",
    status: "applied",
    createdAt: "2026-06-26T00:00:00.000Z",
    updatedAt: "2026-06-26T00:00:00.000Z",
    ...input,
  };
}

describe("buildAppliedSuggestionsReviewPreview", () => {
  it("reconstructs matched applied suggestions without showing a global stale warning", () => {
    const preview = buildAppliedSuggestionsReviewPreview({
      document: {
        id: "doc-1",
        title: "Document",
        current_markdown: "Hello there. Sharp writing.",
        editor_json: null,
      },
      suggestions: [
        suggestion({
          id: "suggestion-1",
          originalText: "Hello world.",
          suggestedText: "Hello there.",
        }),
        suggestion({
          id: "suggestion-2",
          originalText: "Long sentence.",
          suggestedText: "Missing now.",
        }),
      ],
    });

    expect(preview.originalMarkdown).toBe("Hello world. Sharp writing.");
    expect(preview.proposedMarkdown).toBe("Hello there. Sharp writing.");
    expect(preview.warnings).toEqual([]);
  });

  it("shows the stale warning only when no applied suggestions can be reconstructed", () => {
    const preview = buildAppliedSuggestionsReviewPreview({
      document: {
        id: "doc-1",
        title: "Document",
        current_markdown: "Unchanged document.",
        editor_json: null,
      },
      suggestions: [
        suggestion({
          id: "suggestion-1",
          originalText: "Before text.",
          suggestedText: "After text.",
        }),
      ],
    });

    expect(preview.originalMarkdown).toBe("Unchanged document.");
    expect(preview.proposedMarkdown).toBe("Unchanged document.");
    expect(preview.warnings).toEqual([
      "Some applied suggestions no longer match the current document exactly, so the before view may match the current document.",
    ]);
  });
});

describe("buildAppliedSuggestionSummary", () => {
  it("counts applied suggestions by normalized type", () => {
    const summary = buildAppliedSuggestionSummary([
      { type: "clarity" },
      { type: "clarity" },
      { type: "grammar" },
      { type: "style" },
      { type: "seo" },
      { type: "unknown" },
    ]);

    expect(summary).toEqual({
      total: 5,
      items: [
        { label: "Clarity", count: 2 },
        { label: "Grammar", count: 1 },
        { label: "Tone", count: 1 },
        { label: "Structure", count: 1 },
      ],
    });
  });

  it("returns an empty summary when no applied suggestion types are countable", () => {
    expect(buildAppliedSuggestionSummary([{ type: "unknown" }])).toEqual({
      total: 0,
      items: [],
    });
  });
});

describe("getAISuggestionCandidateRejectionReason", () => {
  const baseSuggestion = {
    type: "clarity" as const,
    originalText: "Original wording",
    suggestedText: "Clearer wording",
    explanation: "Makes the text easier to understand.",
  };

  it("rejects no-op suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        suggestion: {
          ...baseSuggestion,
          suggestedText: "Original wording",
        },
        type: "clarity",
        originalText: "Original wording",
      }),
    ).toBe("no_op");
  });

  it("rejects cosmetic whitespace-only changes outside formatting", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        suggestion: {
          ...baseSuggestion,
          originalText: "Original   wording",
          suggestedText: "Original wording",
        },
        type: "clarity",
        originalText: "Original   wording",
      }),
    ).toBe("cosmetic_whitespace");
  });

  it("allows cosmetic whitespace changes for formatting suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        suggestion: {
          ...baseSuggestion,
          type: "formatting",
          originalText: "Original   wording",
          suggestedText: "Original wording",
        },
        type: "formatting",
        originalText: "Original   wording",
      }),
    ).toBeNull();
  });

  it("rejects unanchored and duplicate suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        suggestion: baseSuggestion,
        type: "clarity",
        originalText: null,
      }),
    ).toBe("unanchored");

    expect(
      getAISuggestionCandidateRejectionReason({
        suggestion: baseSuggestion,
        type: "clarity",
        originalText: "Original wording",
        seenOriginalTexts: new Set(["Original wording"]),
      }),
    ).toBe("duplicate_target");
  });

  it("rejects non-grammar suggestions for proofread actions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        action: "proofread_correct",
        suggestion: {
          ...baseSuggestion,
          type: "clarity",
        },
        type: "clarity",
        originalText: "Original wording",
      }),
    ).toBe("wrong_action_category");

    expect(
      getAISuggestionCandidateRejectionReason({
        action: "proofread_correct",
        suggestion: {
          ...baseSuggestion,
          type: "grammar",
        },
        type: "grammar",
        originalText: "Original wording",
      }),
    ).toBeNull();
  });

  it("restricts improve readability to clarity and conciseness suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        action: "improve_readability",
        suggestion: {
          ...baseSuggestion,
          type: "clarity",
        },
        type: "clarity",
        originalText: "Original wording",
      }),
    ).toBeNull();

    expect(
      getAISuggestionCandidateRejectionReason({
        action: "improve_readability",
        suggestion: {
          ...baseSuggestion,
          type: "conciseness",
        },
        type: "conciseness",
        originalText: "Original wording",
      }),
    ).toBeNull();

    expect(
      getAISuggestionCandidateRejectionReason({
        action: "improve_readability",
        suggestion: {
          ...baseSuggestion,
          type: "grammar",
        },
        type: "grammar",
        originalText: "Original wording",
      }),
    ).toBe("wrong_action_category");
  });
});
