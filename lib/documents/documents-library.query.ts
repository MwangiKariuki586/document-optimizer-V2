import type { DocumentsLibraryResult } from "@/lib/documents/documents-library.service";

export const DOCUMENTS_LIBRARY_STALE_TIME_MS = 5 * 60 * 1000;
export const DEFAULT_DOCUMENTS_LIBRARY_PAGE_SIZE = 10;

export type DocumentsLibraryQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  type: string;
  fidelity: string;
  sort: string;
  tab: string;
};

type QueryValueReader = (key: string) => string | undefined;

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonEmpty(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

export function parseDocumentsLibraryQuery(
  read: QueryValueReader,
): DocumentsLibraryQuery {
  return {
    page: positiveInteger(read("page"), 1),
    pageSize: positiveInteger(
      read("pageSize"),
      DEFAULT_DOCUMENTS_LIBRARY_PAGE_SIZE,
    ),
    search: nonEmpty(read("search"), ""),
    status: nonEmpty(read("status"), "all"),
    type: nonEmpty(read("type"), "all"),
    fidelity: nonEmpty(read("fidelity"), "all"),
    sort: nonEmpty(read("sort"), "lastUpdated"),
    tab: nonEmpty(read("tab"), "all"),
  };
}

export const documentsLibraryQueryRootKey = ["documents-library"] as const;

export function documentsLibraryQueryKey(query: DocumentsLibraryQuery) {
  return [...documentsLibraryQueryRootKey, query] as const;
}

export function documentsLibraryApiUrl(query: DocumentsLibraryQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    search: query.search,
    status: query.status,
    type: query.type,
    fidelity: query.fidelity,
    sort: query.sort,
    tab: query.tab,
  });

  return `/api/documents?${params.toString()}`;
}

export async function fetchDocumentsLibrary(
  query: DocumentsLibraryQuery,
): Promise<DocumentsLibraryResult> {
  const response = await fetch(documentsLibraryApiUrl(query), {
    headers: { Accept: "application/json" },
  });
  const payload = (await response.json()) as {
    success: boolean;
    data?: DocumentsLibraryResult;
    error?: string;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error ?? "Failed to load documents.");
  }

  return payload.data;
}
