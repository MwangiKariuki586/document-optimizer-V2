import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  applySuggestion,
  buildAppliedSuggestionSummary,
  buildAppliedSuggestionsReviewPreview,
  getAISuggestionCandidateRejectionReason,
  saveSuggestionsFromAIResult,
} from "@/lib/suggestions/suggestions.service";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import type { Database } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import {
  getOrCreateMutationSnapshot,
  updateMutationSnapshotSessionHash,
} from "@/lib/versions/versions.service";

vi.mock("@/lib/usage/usage.service", () => ({
  recordUsageEvent: vi.fn(),
}));

vi.mock("@/lib/versions/versions.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/versions/versions.service")>();

  return {
    ...actual,
    getOrCreateMutationSnapshot: vi.fn(),
    updateMutationSnapshotSessionHash: vi.fn(),
  };
});

type QueryResult = {
  maybeSingle?: unknown;
};

type QueryBuilder = {
  table: string;
  payloads: unknown[];
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
};

function createBuilder(table: string, result: QueryResult): QueryBuilder {
  const payloads: unknown[] = [];
  const builder: QueryBuilder = {
    table,
    payloads,
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn((payload: unknown) => {
      builder.payloads.push(payload);
      return builder;
    }),
    maybeSingle: vi.fn(async () => ({
      data: result.maybeSingle ?? null,
      error: null,
    })),
  };

  return builder;
}

function createSupabaseMock(builders: QueryBuilder[]) {
  const queue = [...builders];
  const from = vi.fn((table: string) => {
    const builder = queue.shift();

    if (!builder) {
      throw new Error(`Unexpected table query: ${table}`);
    }

    expect(table).toBe(builder.table);
    return builder;
  });

  return {
    supabase: { from } as unknown as SupabaseClient<Database>,
    from,
  };
}

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

describe("applySuggestion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses a grouped AI-run snapshot and records reuse metadata", async () => {
    vi.mocked(getOrCreateMutationSnapshot).mockResolvedValue({
      id: "version-id",
      versionNumber: 7,
      sessionId: "session-id",
      reused: true,
    });
    vi.mocked(updateMutationSnapshotSessionHash).mockResolvedValue(undefined);
    vi.mocked(recordUsageEvent).mockResolvedValue(undefined);

    const suggestionLookup = createBuilder("suggestions", {
      maybeSingle: {
        id: "suggestion-id",
        document_id: "doc-1",
        ai_request_id: "request-1",
        type: "clarity",
        original_text: "world",
        suggested_text: "there",
        explanation: "Clearer wording.",
        status: "pending",
        created_at: "2026-07-04T00:00:00.000Z",
        updated_at: "2026-07-04T00:00:00.000Z",
      },
    });
    const documentLookup = createBuilder("documents", {
      maybeSingle: {
        title: "Document",
        current_markdown: "Hello world.",
        editor_json: null,
        formatting_metadata: { fidelity: "plain" },
      },
    });
    const documentUpdate = createBuilder("documents", {
      maybeSingle: { id: "doc-1" },
    });
    const suggestionStatus = createBuilder("suggestions", {
      maybeSingle: { id: "suggestion-id" },
    });
    const { supabase } = createSupabaseMock([
      suggestionLookup,
      documentLookup,
      documentUpdate,
      suggestionStatus,
    ]);

    const result = await applySuggestion(supabase, {
      userId: "user-1",
      documentId: "doc-1",
      suggestionId: "suggestion-id",
    });

    expect(result).toEqual(
      expect.objectContaining({
        documentId: "doc-1",
        suggestionId: "suggestion-id",
        versionNumber: 7,
        currentMarkdown: "Hello there.",
        wordCount: 2,
      }),
    );
    expect(getOrCreateMutationSnapshot).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-1",
        documentId: "doc-1",
        title: "Document",
        source: "suggestion_apply",
        contentMarkdown: "Hello world.",
        scope: "ai_request",
        scopeId: "request-1",
      }),
    );
    expect(documentUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        current_markdown: "Hello there.",
        word_count: 2,
      }),
    );
    expect(suggestionStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "applied" }),
    );
    expect(updateMutationSnapshotSessionHash).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        sessionId: "session-id",
        userId: "user-1",
        contentMarkdown: "Hello there.",
      }),
    );
    expect(recordUsageEvent).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-1",
        eventType: "suggestion_apply",
        documentId: "doc-1",
        metadata: expect.objectContaining({
          suggestionId: "suggestion-id",
          versionNumber: 7,
          snapshotSessionId: "session-id",
          snapshotReused: true,
          appliedCount: 1,
        }),
      }),
    );
  });

  it("falls back to an ungrouped snapshot for legacy suggestions without an AI request", async () => {
    vi.mocked(getOrCreateMutationSnapshot).mockResolvedValue({
      id: "version-id",
      versionNumber: 8,
      sessionId: null,
      reused: false,
    });
    vi.mocked(updateMutationSnapshotSessionHash).mockResolvedValue(undefined);
    vi.mocked(recordUsageEvent).mockResolvedValue(undefined);

    const suggestionLookup = createBuilder("suggestions", {
      maybeSingle: {
        id: "suggestion-id",
        document_id: "doc-1",
        ai_request_id: null,
        type: "clarity",
        original_text: "world",
        suggested_text: "there",
        explanation: "Clearer wording.",
        status: "pending",
        created_at: "2026-07-04T00:00:00.000Z",
        updated_at: "2026-07-04T00:00:00.000Z",
      },
    });
    const documentLookup = createBuilder("documents", {
      maybeSingle: {
        title: "Document",
        current_markdown: "Hello world.",
        editor_json: null,
        formatting_metadata: {},
      },
    });
    const documentUpdate = createBuilder("documents", {
      maybeSingle: { id: "doc-1" },
    });
    const suggestionStatus = createBuilder("suggestions", {
      maybeSingle: { id: "suggestion-id" },
    });
    const { supabase } = createSupabaseMock([
      suggestionLookup,
      documentLookup,
      documentUpdate,
      suggestionStatus,
    ]);

    await applySuggestion(supabase, {
      userId: "user-1",
      documentId: "doc-1",
      suggestionId: "suggestion-id",
    });

    expect(getOrCreateMutationSnapshot).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        scope: undefined,
        scopeId: null,
        notes: "Before applying suggestion suggestion-id",
      }),
    );
  });
});

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

describe("saveSuggestionsFromAIResult", () => {
  it("does not persist suggestions for summarize and shorten results", async () => {
    const result = await saveSuggestionsFromAIResult({} as never, {
      userId: "user-1",
      documentId: "doc-1",
      aiRequestId: "request-1",
      action: "summarize_shorten",
      originalMarkdown: "Original document content.",
      output: {
        mode: "preview",
        workflow: "result_preview",
        resultMode: "summary",
        summary: "Created a summary.",
        revisedMarkdown: "Short summary.",
        suggestions: [
          {
            type: "clarity",
            originalText: "Original document content.",
            suggestedText: "Short summary.",
            explanation: "Should not be saved for summary results.",
          },
        ],
        analysis: { notes: [] },
        warnings: [],
      },
    });

    expect(result).toEqual([]);
  });

  it("does not persist suggestions for translation results", async () => {
    const result = await saveSuggestionsFromAIResult({} as never, {
      userId: "user-1",
      documentId: "doc-1",
      aiRequestId: "request-1",
      action: "translate_document",
      originalMarkdown: "Original document content.",
      output: {
        mode: "preview",
        workflow: "result_preview",
        resultMode: "translation",
        targetLanguage: "sw",
        summary: "Created a translation.",
        revisedMarkdown: "Maudhui ya hati yaliyotafsiriwa.",
        suggestions: [
          {
            type: "clarity",
            originalText: "Original document content.",
            suggestedText: "Maudhui ya hati yaliyotafsiriwa.",
            explanation: "Should not be saved for translation results.",
          },
        ],
        analysis: { notes: [] },
        warnings: [],
      },
    });

    expect(result).toEqual([]);
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

  it("restricts tone alignment to tone suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        action: "tone_alignment",
        suggestion: {
          ...baseSuggestion,
          type: "tone",
        },
        type: "tone",
        originalText: "Original wording",
      }),
    ).toBeNull();

    expect(
      getAISuggestionCandidateRejectionReason({
        action: "tone_alignment",
        suggestion: {
          ...baseSuggestion,
          type: "clarity",
        },
        type: "clarity",
        originalText: "Original wording",
      }),
    ).toBe("wrong_action_category");
  });

  it("restricts structure flow inline suggestions to structure suggestions", () => {
    expect(
      getAISuggestionCandidateRejectionReason({
        action: "structure_flow",
        suggestion: {
          ...baseSuggestion,
          type: "structure",
        },
        type: "structure",
        originalText: "Original wording",
      }),
    ).toBeNull();

    expect(
      getAISuggestionCandidateRejectionReason({
        action: "structure_flow",
        suggestion: {
          ...baseSuggestion,
          type: "clarity",
        },
        type: "clarity",
        originalText: "Original wording",
      }),
    ).toBe("wrong_action_category");
  });
});
