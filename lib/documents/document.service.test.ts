import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createPasteDocument,
  getDocumentForUser,
  updateDocumentContent,
} from "@/lib/documents/document.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import { createDocumentVersion } from "@/lib/versions/versions.service";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/usage/usage.service", () => ({
  recordUsageEvent: vi.fn(),
}));

vi.mock("@/lib/versions/versions.service", () => ({
  createDocumentVersion: vi.fn(),
}));

type QueryResult = {
  maybeSingle?: unknown;
  single?: unknown;
  rows?: unknown[];
};

type QueryBuilder = {
  table: string;
  payloads: unknown[];
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
};

function createBuilder(table: string, result: QueryResult): QueryBuilder {
  const payloads: unknown[] = [];
  const builder: QueryBuilder = {
    table,
    payloads,
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn((payload: unknown) => {
      builder.payloads.push(payload);
      return builder;
    }),
    update: vi.fn((payload: unknown) => {
      builder.payloads.push(payload);
      return builder;
    }),
    delete: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({
      data: result.maybeSingle ?? null,
      error: null,
    })),
    single: vi.fn(async () => ({
      data: result.single ?? null,
      error: null,
    })),
    then: vi.fn((resolve: (value: { data: unknown[]; error: null }) => void) =>
      resolve({ data: result.rows ?? [], error: null }),
    ),
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

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const createDocumentVersionMock = vi.mocked(createDocumentVersion);
const recordUsageEventMock = vi.mocked(recordUsageEvent);

describe("document service MVP flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createDocumentVersionMock.mockResolvedValue({
      id: "version-id",
      versionNumber: 1,
    });
  });

  it("creates pasted documents with normalized content, an initial version, and usage", async () => {
    const rpc = vi.fn(async () => ({
      data: [{ document_id: "document-id", document_title: "Pasted Draft" }],
      error: null,
    }));
    const supabase = { rpc } as unknown as SupabaseClient<Database>;
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await createPasteDocument({
      userId: "user-id",
      title: "  Pasted Draft  ",
      content: "First line\r\n\r\nSecond line",
    });

    expect(result).toEqual({ id: "document-id", title: "Pasted Draft" });
    expect(rpc).toHaveBeenCalledWith("create_paste_document_atomic", {
      p_user_id: "user-id",
      p_title: "Pasted Draft",
      p_content: "First line\n\nSecond line",
      p_editor_json: expect.objectContaining({ type: "doc" }),
      p_word_count: 4,
    });
  });

  it("updates manual editor content only through the owned document row", async () => {
    const documents = createBuilder("documents", {
      maybeSingle: { id: "document-id" },
    });
    const { supabase } = createSupabaseMock([documents]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await updateDocumentContent({
      userId: "user-id",
      documentId: "document-id",
      title: "  Edited Draft  ",
      editorJson: { type: "doc", content: [] },
      currentMarkdown: "Saved content here",
    });

    expect(result).toEqual({ id: "document-id" });
    expect(documents.eq).toHaveBeenCalledWith("id", "document-id");
    expect(documents.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(documents.update).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Edited Draft",
        current_markdown: "Saved content here",
        word_count: 3,
      }),
    );
    expect(recordUsageEventMock).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-id",
        eventType: "manual_save",
        documentId: "document-id",
      }),
    );
  });

  it("does not record usage when a manual save finds no owned document", async () => {
    const documents = createBuilder("documents", { maybeSingle: null });
    const { supabase } = createSupabaseMock([documents]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await updateDocumentContent({
      userId: "user-id",
      documentId: "document-id",
      title: "Missing Draft",
      editorJson: { type: "doc", content: [] },
      currentMarkdown: "No row should match",
    });

    expect(result).toBeNull();
    expect(documents.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(recordUsageEventMock).not.toHaveBeenCalled();
  });

  it("loads editor documents through document, version, and activity queries scoped to the owner", async () => {
    const documents = createBuilder("documents", {
      maybeSingle: {
        id: "document-id",
        title: "Owned Draft",
        file_type: "none",
        fidelity_status: "Structure Preserved",
        original_file_key: null,
        editor_json: { type: "doc", content: [] },
        current_markdown: "Current content",
        word_count: 2,
        updated_at: "2026-06-17T00:00:00.000Z",
      },
    });
    const versions = createBuilder("document_versions", {
      rows: [{ version_number: 1, content_markdown: "Current content" }],
    });
    const usage = createBuilder("usage_ledger", {
      maybeSingle: { metadata: {} },
    });
    const { supabase } = createSupabaseMock([documents, versions, usage]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await getDocumentForUser("user-id", "document-id");

    expect(result?.versionNumber).toBe(1);
    expect(documents.eq).toHaveBeenCalledWith("id", "document-id");
    expect(documents.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(versions.eq).toHaveBeenCalledWith("document_id", "document-id");
    expect(versions.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(usage.eq).toHaveBeenCalledWith("document_id", "document-id");
    expect(usage.eq).toHaveBeenCalledWith("user_id", "user-id");
  });
});
