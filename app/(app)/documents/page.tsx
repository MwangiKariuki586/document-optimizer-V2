import { auth } from "@clerk/nextjs/server";
import { PageShell } from "@/components/layout/PageShell";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { DocumentsLibraryWorkspace } from "@/components/documents/DocumentsLibraryWorkspace";
import {
  getDocumentsLibrary,
  getEmptyDocumentsLibrary,
  type DocumentsLibraryResult,
} from "@/lib/documents/documents-library.service";

const DEFAULT_PAGE_SIZE = 10;

function parseIntParam(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseInt(value, 10);
  return isNaN(n) || n < 1 ? fallback : n;
}

function parseStringParam(
  value: string | undefined,
  fallback: string,
): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadLibraryData(
  userId: string,
  rawParams: Record<string, string | string[] | undefined>,
): Promise<{ data: DocumentsLibraryResult; error: string | null }> {
  // Coerce array values to string (take first)
  function strParam(key: string): string | undefined {
    const val = rawParams[key];
    return Array.isArray(val) ? val[0] : val;
  }

  const params = {
    userId,
    page: parseIntParam(strParam("page"), 1),
    pageSize: parseIntParam(strParam("pageSize"), DEFAULT_PAGE_SIZE),
    search: parseStringParam(strParam("search"), ""),
    status: parseStringParam(strParam("status"), "all"),
    type: parseStringParam(strParam("type"), "all"),
    fidelity: parseStringParam(strParam("fidelity"), "all"),
    sort: parseStringParam(strParam("sort"), "lastUpdated"),
    tab: parseStringParam(strParam("tab"), "all"),
  };

  try {
    const data = await getDocumentsLibrary(params);
    return { data, error: null };
  } catch (err) {
    console.error("[documents/page]", err);
    return {
      data: getEmptyDocumentsLibrary(),
      error:
        "We could not load your documents. Check the server configuration and try again.",
    };
  }
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const rawParams = await searchParams;

  const { data, error } = userId
    ? await loadLibraryData(userId, rawParams)
    : { data: getEmptyDocumentsLibrary(), error: null };

  return (
    <PageShell>
      {error ? (
        <InlineAlert title="Documents unavailable" variant="warning">
          {error}
        </InlineAlert>
      ) : null}

      <DocumentsLibraryWorkspace data={data} />
    </PageShell>
  );
}
