import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  downloadDocumentExport,
  generateDocumentExport,
} from "@/lib/export/export.service";
import type { CreateExportOptions } from "@/lib/export/export.validators";
import {
  createSignedExportUrl,
  downloadExportFile,
  removeExportFile,
  uploadExportFile,
} from "@/lib/storage/storage.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/storage/storage.service", () => ({
  createSignedExportUrl: vi.fn(),
  downloadExportFile: vi.fn(),
  removeExportFile: vi.fn(),
  uploadExportFile: vi.fn(),
}));

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
  insert: ReturnType<typeof vi.fn>;
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
    insert: vi.fn((payload: unknown) => {
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

const options: CreateExportOptions = {
  includeAiImprovements: true,
  includeTrackChanges: false,
  addSummary: true,
  addMetadata: true,
  imageQuality: "High (300 DPI)",
  pageSize: "A4 (210 x 297 mm)",
  margins: "Standard (1 inch)",
  watermark: "None",
};

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient);
const uploadExportFileMock = vi.mocked(uploadExportFile);
const createSignedExportUrlMock = vi.mocked(createSignedExportUrl);
const downloadExportFileMock = vi.mocked(downloadExportFile);
const removeExportFileMock = vi.mocked(removeExportFile);
const recordUsageEventMock = vi.mocked(recordUsageEvent);

describe("generateDocumentExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadExportFileMock.mockResolvedValue(
      "user-id/document-id/exports/export-id/document.txt",
    );
    createSignedExportUrlMock.mockResolvedValue("https://signed.example/export");
  });

  it("generates private exports from owned documents and records usage", async () => {
    const documents = createBuilder("documents", {
      maybeSingle: {
        id: "document-id",
        title: "Quarterly Plan",
        current_markdown: "# Plan\n\nShip the MVP.",
        extracted_text: null,
        fidelity_status: "Structure Preserved",
        word_count: 4,
      },
    });
    const exports = createBuilder("exports", {
      single: { id: "export-id" },
    });
    const { supabase } = createSupabaseMock([documents, exports]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await generateDocumentExport({
      userId: "user-id",
      documentId: "document-id",
      format: "txt",
      options,
    });

    expect(documents.eq).toHaveBeenCalledWith("id", "document-id");
    expect(documents.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(uploadExportFileMock).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-id",
        documentId: "document-id",
        fileName: "quarterly-plan.txt",
        contentType: "text/plain",
      }),
    );
    expect(exports.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-id",
        document_id: "document-id",
        format: "txt",
        status: "completed",
        warning: "Plain text exports remove rich formatting.",
      }),
    );
    expect(recordUsageEventMock).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        userId: "user-id",
        documentId: "document-id",
        eventType: "export",
        metadata: expect.objectContaining({ format: "txt" }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: "export-id",
        format: "txt",
        fileName: "quarterly-plan.txt",
        signedUrl: "https://signed.example/export",
        downloadUrl: "/api/documents/document-id/export/export-id/download",
        warning: "Plain text exports remove rich formatting.",
      }),
    );
  });

  it("returns null without side effects when the document is not owned", async () => {
    const documents = createBuilder("documents", { maybeSingle: null });
    const { supabase } = createSupabaseMock([documents]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await generateDocumentExport({
      userId: "user-id",
      documentId: "document-id",
      format: "pdf",
      options,
    });

    expect(result).toBeNull();
    expect(uploadExportFileMock).not.toHaveBeenCalled();
    expect(recordUsageEventMock).not.toHaveBeenCalled();
  });

  it("removes uploaded export files when the export record cannot be created", async () => {
    const documents = createBuilder("documents", {
      maybeSingle: {
        id: "document-id",
        title: "Broken Export",
        current_markdown: "Content",
        extracted_text: null,
        fidelity_status: "Structure Preserved",
        word_count: 1,
      },
    });
    const exports = createBuilder("exports", { single: null });
    const { supabase } = createSupabaseMock([documents, exports]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    await expect(
      generateDocumentExport({
        userId: "user-id",
        documentId: "document-id",
        format: "markdown",
        options,
      }),
    ).rejects.toThrow("Failed to create export record");

    expect(removeExportFileMock).toHaveBeenCalledWith(
      supabase,
      "user-id/document-id/exports/export-id/document.txt",
    );
  });
});

describe("downloadDocumentExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    downloadExportFileMock.mockResolvedValue(Buffer.from("export data"));
  });

  it("downloads completed exports only when scoped to document and owner", async () => {
    const exports = createBuilder("exports", {
      maybeSingle: {
        id: "export-id",
        format: "pdf",
        file_key: "user-id/document-id/exports/export-id-quarterly-plan.pdf",
      },
    });
    const { supabase } = createSupabaseMock([exports]);
    createSupabaseServerClientMock.mockReturnValue(supabase);

    const result = await downloadDocumentExport({
      userId: "user-id",
      documentId: "document-id",
      exportId: "export-id",
    });

    expect(exports.eq).toHaveBeenCalledWith("id", "export-id");
    expect(exports.eq).toHaveBeenCalledWith("document_id", "document-id");
    expect(exports.eq).toHaveBeenCalledWith("user_id", "user-id");
    expect(exports.eq).toHaveBeenCalledWith("status", "completed");
    expect(downloadExportFileMock).toHaveBeenCalledWith(
      supabase,
      "user-id/document-id/exports/export-id-quarterly-plan.pdf",
    );
    expect(result).toEqual({
      fileName: "quarterly-plan.pdf",
      contentType: "application/pdf",
      data: Buffer.from("export data"),
    });
  });
});
