import { describe, expect, it } from "vitest";

import { buildAppliedSuggestionsReviewPreview } from "@/lib/suggestions/suggestions.service";
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
