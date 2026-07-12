import { describe, expect, it, vi } from "vitest";

const { revalidateTagMock, unstableCacheMock } = vi.hoisted(() => ({
  revalidateTagMock: vi.fn(),
  unstableCacheMock: vi.fn(
    <T extends (...args: never[]) => Promise<unknown>>(callback: T) =>
      callback,
  ),
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
  unstable_cache: unstableCacheMock,
}));

vi.mock("@/lib/dashboard/dashboard.service", () => ({
  getDashboardData: vi.fn(),
}));

vi.mock("@/lib/documents/documents-library.service", () => ({
  getDocumentsLibrary: vi.fn(),
}));

vi.mock("@/lib/documents/document.service", () => ({
  getDocumentForUser: vi.fn(),
}));

vi.mock("@/lib/ai/ai.service", () => ({
  listDocumentAIActionRuns: vi.fn(),
}));

vi.mock("@/lib/suggestions/suggestions.service", () => ({
  listDocumentSuggestions: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(() => ({})),
}));

import {
  DOCUMENTS_LIBRARY_CACHE_REVALIDATE_SECONDS,
  dashboardCacheTag,
  documentEditorCacheKey,
  documentEditorCacheTag,
  documentsLibraryCacheKey,
  documentsLibraryCacheTag,
  getCachedDocumentEditorData,
  getCachedDocumentsLibrary,
  invalidateDocumentCache,
  invalidateWorkspaceCache,
  workspaceCacheTag,
} from "@/lib/cache/workspace-cache";
import { getDocumentForUser } from "@/lib/documents/document.service";

describe("workspace cache", () => {
  it("keeps the documents library cache longer than volatile workspace data", () => {
    expect(DOCUMENTS_LIBRARY_CACHE_REVALIDATE_SECONDS).toBe(300);
  });

  it("builds user-scoped tags", () => {
    expect(workspaceCacheTag("user_123")).toBe("workspace:user_123");
    expect(dashboardCacheTag("user_123")).toBe("dashboard:user_123");
    expect(documentsLibraryCacheTag("user_123")).toBe(
      "documents-library:user_123",
    );
    expect(documentEditorCacheTag("user_123", "doc_123")).toBe(
      "document-editor:user_123:doc_123",
    );
  });

  it("includes every documents library query dimension in the cache key", () => {
    expect(
      documentsLibraryCacheKey({
        userId: "user_123",
        page: 2,
        pageSize: 25,
        search: "resume",
        status: "ready",
        type: "pdf",
        fidelity: "Plain Text Only",
        sort: "name",
        tab: "archived",
      }),
    ).toEqual([
      "documents-library",
      "user_123",
      "2",
      "25",
      "resume",
      "ready",
      "pdf",
      "Plain Text Only",
      "name",
      "archived",
    ]);
  });

  it("builds a user-and-document-scoped editor cache key", () => {
    expect(documentEditorCacheKey("user_123", "doc_123")).toEqual([
      "document-editor",
      "user_123",
      "doc_123",
    ]);
  });

  it("passes user-and-document-scoped editor tags to unstable_cache", async () => {
    vi.mocked(getDocumentForUser).mockResolvedValueOnce(null);

    await getCachedDocumentEditorData("user_123", "doc_123");

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["document-editor", "user_123", "doc_123"],
      {
        revalidate: 60,
        tags: [
          "workspace:user_123",
          "documents-library:user_123",
          "document-editor:user_123:doc_123",
        ],
      },
    );
  });

  it("passes user-scoped library tags to unstable_cache", async () => {
    await getCachedDocumentsLibrary({
      userId: "user_123",
      page: 1,
      pageSize: 10,
      search: "",
      status: "all",
      type: "all",
      fidelity: "all",
      sort: "lastUpdated",
      tab: "all",
    });

    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      [
        "documents-library",
        "user_123",
        "1",
        "10",
        "",
        "all",
        "all",
        "all",
        "lastUpdated",
        "all",
      ],
      {
        revalidate: 300,
        tags: ["workspace:user_123", "documents-library:user_123"],
      },
    );
  });

  it("invalidates all workspace tags by default", () => {
    revalidateTagMock.mockClear();

    invalidateWorkspaceCache("user_123");

    expect(revalidateTagMock).toHaveBeenCalledTimes(3);
    expect(revalidateTagMock).toHaveBeenCalledWith("workspace:user_123", {
      expire: 0,
    });
    expect(revalidateTagMock).toHaveBeenCalledWith("dashboard:user_123", {
      expire: 0,
    });
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "documents-library:user_123",
      { expire: 0 },
    );
  });

  it("invalidates workspace and document editor tags together", () => {
    revalidateTagMock.mockClear();

    invalidateDocumentCache("user_123", "doc_123");

    expect(revalidateTagMock).toHaveBeenCalledTimes(4);
    expect(revalidateTagMock).toHaveBeenCalledWith("workspace:user_123", {
      expire: 0,
    });
    expect(revalidateTagMock).toHaveBeenCalledWith("dashboard:user_123", {
      expire: 0,
    });
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "documents-library:user_123",
      { expire: 0 },
    );
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "document-editor:user_123:doc_123",
      { expire: 0 },
    );
  });

  it("logs and continues if tag invalidation fails", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    revalidateTagMock.mockReset();
    revalidateTagMock.mockImplementationOnce(() => {
      throw new Error("cache unavailable");
    });

    expect(() => invalidateWorkspaceCache("user_123")).not.toThrow();
    expect(revalidateTagMock).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[workspace-cache/invalidate]",
      expect.objectContaining({ tag: "workspace:user_123" }),
    );

    consoleSpy.mockRestore();
  });
});
