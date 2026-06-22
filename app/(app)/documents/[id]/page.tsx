import { notFound, redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentForUser } from "@/lib/documents/document.service";
import { listDocumentSuggestions } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";
import { getDocumentIngestion } from "@/lib/ingestion/ingestion.service";

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

  const document = await getDocumentForUser(userId, id);

  if (!document) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const initialSuggestions =
    (await listDocumentSuggestions(supabase, userId, id)) ?? [];

  return (
    <EditorWorkspace
      document={document}
      initialSuggestions={initialSuggestions}
    />
  );
}
