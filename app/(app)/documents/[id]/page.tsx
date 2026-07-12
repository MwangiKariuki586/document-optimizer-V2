import { notFound, redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getCachedDocumentEditorData } from "@/lib/cache/workspace-cache";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { getDocumentIngestion } from "@/lib/ingestion/ingestion.service";

export const unstable_dynamicStaleTime = 60;

type DocumentEditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentEditorPage({
  params,
}: DocumentEditorPageProps) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  const ingestion = await getDocumentIngestion(userId, id);

  if (ingestion && ingestion.status !== "completed") {
    redirect(
      `/documents/new?tab=upload&processingDocumentId=${encodeURIComponent(id)}`,
    );
  }

  const { document, initialSuggestions, initialAIActionRuns } =
    await getCachedDocumentEditorData(userId, id);

  if (!document) {
    notFound();
  }

  return (
    <EditorWorkspace
      document={document}
      initialSuggestions={initialSuggestions ?? []}
      initialAIActionRuns={initialAIActionRuns}
    />
  );
}
