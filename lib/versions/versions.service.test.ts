import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import {
  getDocumentContentHash,
  getOrCreateMutationSnapshot,
  restoreDocumentVersion,
} from "@/lib/versions/versions.service";

vi.mock("@/lib/usage/usage.service", () => ({
  recordUsageEvent: vi.fn(),
}));

type QueryResult = {
  maybeSingle?: unknown;
  single?: unknown;
};

type QueryBuilder = {
  table: string;
  payloads: unknown[];
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  is: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
};

function createBuilder(table: string, result: QueryResult): QueryBuilder {
  const payloads: unknown[] = [];
  const builder: QueryBuilder = {
    table,
    payloads,
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    insert: vi.fn((payload: unknown) => {
      builder.payloads.push(payload);
      return builder;
    }),
    update: vi.fn((payload: unknown) => {
      builder.payloads.push(payload);
      return builder;
    }),
    maybeSingle: vi.fn(async () => ({
      data: result.maybeSingle ?? null,
      error: null,
    })),
    single: vi.fn(async () => ({
      data: result.single ?? null,
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

describe("restoreDocumentVersion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("snapshots the current document before restoring the selected version", async () => {
    const selectedVersion = createBuilder("document_versions", {
      maybeSingle: {
        version_number: 2,
        content_markdown: "Restored version content",
        editor_json: { type: "doc", content: [] },
        formatting_metadata: { fidelity: "preserved" },
        title: "Saved version",
      },
    });
    const currentDocument = createBuilder("documents", {
      maybeSingle: {
        title: "Current title",
        current_markdown: "Current live content",
        editor_json: { type: "doc", content: [{ type: "paragraph" }] },
        formatting_metadata: { fidelity: "preserved" },
      },
    });
    const snapshotVersion = createBuilder("document_versions", {
      single: { id: "snapshot-id", version_number: 5 },
    });
    const restoredDocument = createBuilder("documents", {
      maybeSingle: { id: "document-id" },
    });
    const { supabase } = createSupabaseMock([
      selectedVersion,
      currentDocument,
      snapshotVersion,
      restoredDocument,
    ]);

    const result = await restoreDocumentVersion(supabase, {
      userId: "user-id",
      documentId: "document-id",
      versionNumber: 2,
    });

    expect(result).toEqual({
      documentId: "document-id",
      selectedVersionNumber: 2,
      restoredVersionNumber: 2,
      currentMarkdown: "Restored version content",
      editorJson: { type: "doc", content: [] },
      wordCount: 3,
    });
    expect(currentDocument.maybeSingle).toHaveBeenCalled();
    expect(snapshotVersion.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "restore",
        content_markdown: "Current live content",
        notes: "Auto-saved before restoring version 2",
      }),
    );
    expect(restoredDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        current_markdown: "Restored version content",
        editor_json: { type: "doc", content: [] },
        formatting_metadata: { fidelity: "preserved" },
        word_count: 3,
      }),
    );
    expect(recordUsageEvent).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-id",
        eventType: "version_restore",
        documentId: "document-id",
        metadata: {
          selectedVersionNumber: 2,
          restoredVersionNumber: 2,
        },
      }),
    );
  });

  it("returns null when the selected version is not owned by the user", async () => {
    const missingVersion = createBuilder("document_versions", {
      maybeSingle: null,
    });
    const { supabase, from } = createSupabaseMock([missingVersion]);

    const result = await restoreDocumentVersion(supabase, {
      userId: "user-id",
      documentId: "document-id",
      versionNumber: 99,
    });

    expect(result).toBeNull();
    expect(from).toHaveBeenCalledTimes(1);
    expect(recordUsageEvent).not.toHaveBeenCalled();
  });
});

describe("getOrCreateMutationSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseInput = {
    userId: "user-id",
    documentId: "document-id",
    title: "Document",
    source: "suggestion_apply" as const,
    contentMarkdown: "Current document content.",
    editorJson: { type: "doc", content: [] },
    formattingMetadata: { fidelity: "preserved" },
    notes: "Before applying AI suggestions from this run",
    scope: "ai_request" as const,
    scopeId: "request-id",
  };

  it("creates a version row and snapshot session for the first suggestion in an AI run", async () => {
    const sessionLookup = createBuilder("document_snapshot_sessions", {
      maybeSingle: null,
    });
    const versionInsert = createBuilder("document_versions", {
      single: { id: "version-id", version_number: 3 },
    });
    const sessionInsert = createBuilder("document_snapshot_sessions", {
      maybeSingle: { id: "session-id" },
    });
    const { supabase } = createSupabaseMock([
      sessionLookup,
      versionInsert,
      sessionInsert,
    ]);

    const result = await getOrCreateMutationSnapshot(supabase, baseInput);

    expect(result).toEqual({
      id: "version-id",
      versionNumber: 3,
      sessionId: "session-id",
      reused: false,
    });
    expect(versionInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "suggestion_apply",
        content_markdown: "Current document content.",
        notes: "Before applying AI suggestions from this run",
      }),
    );
    expect(sessionInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-id",
        document_id: "document-id",
        source: "suggestion_apply",
        scope: "ai_request",
        scope_id: "request-id",
        version_id: "version-id",
        base_content_hash: getDocumentContentHash(baseInput),
        last_content_hash: getDocumentContentHash(baseInput),
      }),
    );
  });

  it("reuses an active session when the stored document hash still matches", async () => {
    const sessionLookup = createBuilder("document_snapshot_sessions", {
      maybeSingle: {
        id: "session-id",
        version_id: "version-id",
        last_content_hash: getDocumentContentHash(baseInput),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });
    const versionLookup = createBuilder("document_versions", {
      maybeSingle: { id: "version-id", version_number: 3 },
    });
    const { supabase, from } = createSupabaseMock([
      sessionLookup,
      versionLookup,
    ]);

    const result = await getOrCreateMutationSnapshot(supabase, baseInput);

    expect(result).toEqual({
      id: "version-id",
      versionNumber: 3,
      sessionId: "session-id",
      reused: true,
    });
    expect(from).toHaveBeenCalledTimes(2);
    expect(versionLookup.insert).not.toHaveBeenCalled();
  });

  it("closes a stale session and creates a new grouped snapshot", async () => {
    const sessionLookup = createBuilder("document_snapshot_sessions", {
      maybeSingle: {
        id: "old-session-id",
        version_id: "old-version-id",
        last_content_hash: "stale-hash",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
    });
    const sessionClose = createBuilder("document_snapshot_sessions", {
      maybeSingle: null,
    });
    const versionInsert = createBuilder("document_versions", {
      single: { id: "new-version-id", version_number: 4 },
    });
    const sessionInsert = createBuilder("document_snapshot_sessions", {
      maybeSingle: { id: "new-session-id" },
    });
    const { supabase } = createSupabaseMock([
      sessionLookup,
      sessionClose,
      versionInsert,
      sessionInsert,
    ]);

    const result = await getOrCreateMutationSnapshot(supabase, baseInput);

    expect(result).toEqual({
      id: "new-version-id",
      versionNumber: 4,
      sessionId: "new-session-id",
      reused: false,
    });
    expect(sessionClose.update).toHaveBeenCalledWith(
      expect.objectContaining({
        closed_at: expect.any(String),
      }),
    );
    expect(versionInsert.insert).toHaveBeenCalledTimes(1);
  });

  it("falls back to a one-off snapshot when there is no grouping scope", async () => {
    const versionInsert = createBuilder("document_versions", {
      single: { id: "version-id", version_number: 5 },
    });
    const { supabase, from } = createSupabaseMock([versionInsert]);

    const result = await getOrCreateMutationSnapshot(supabase, {
      ...baseInput,
      scope: undefined,
      scopeId: null,
    });

    expect(result).toEqual({
      id: "version-id",
      versionNumber: 5,
      sessionId: null,
      reused: false,
    });
    expect(from).toHaveBeenCalledTimes(1);
    expect(versionInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "suggestion_apply",
      }),
    );
  });
});
