import { notFound } from "next/navigation";

import { ExportWorkspace } from "@/components/export/ExportWorkspace";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentForUser } from "@/lib/documents/document.service";
import { getAppliedSuggestionSummary } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExportPage({ params }: ExportPageProps) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  const document = await getDocumentForUser(userId, id);

  if (!document) {
    notFound();
  }

  const improvementSummary = await getAppliedSuggestionSummary(
    createSupabaseServerClient(),
    {
      userId,
      documentId: id,
    },
  );

  return (
    <ExportWorkspace
      document={document}
      improvementSummary={improvementSummary}
    />
  );
}
