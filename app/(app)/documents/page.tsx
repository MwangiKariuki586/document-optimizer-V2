import { auth } from "@clerk/nextjs/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PageShell } from "@/components/layout/PageShell";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { DocumentsLibraryWorkspace } from "@/components/documents/DocumentsLibraryWorkspace";
import { getCachedDocumentsLibrary } from "@/lib/cache/workspace-cache";
import {
  getEmptyDocumentsLibrary,
  type DocumentsLibraryResult,
} from "@/lib/documents/documents-library.service";
import {
  documentsLibraryQueryKey,
  parseDocumentsLibraryQuery,
  type DocumentsLibraryQuery,
} from "@/lib/documents/documents-library.query";

export const unstable_dynamicStaleTime = 300;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadLibraryData(
  userId: string,
  query: DocumentsLibraryQuery,
): Promise<{ data: DocumentsLibraryResult; error: string | null }> {
  try {
    const data = await getCachedDocumentsLibrary({ userId, ...query });
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
  const query = parseDocumentsLibraryQuery((key) => {
    const value = rawParams[key];
    return Array.isArray(value) ? value[0] : value;
  });

  const { data, error } = userId
    ? await loadLibraryData(userId, query)
    : { data: getEmptyDocumentsLibrary(), error: null };
  const queryClient = new QueryClient();
  queryClient.setQueryData(documentsLibraryQueryKey(query), data);

  return (
    <PageShell>
      {error ? (
        <InlineAlert title="Documents unavailable" variant="warning">
          {error}
        </InlineAlert>
      ) : null}

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DocumentsLibraryWorkspace />
      </HydrationBoundary>
    </PageShell>
  );
}
