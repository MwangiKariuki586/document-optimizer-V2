import { notFound } from "next/navigation";

import { ExportWorkspace } from "@/components/export/ExportWorkspace";
import { getAIRequestPreview } from "@/lib/ai/ai.service";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentForUser } from "@/lib/documents/document.service";
import { countWords } from "@/lib/documents/text-to-editor";
import { getAppliedSuggestionSummary } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ requestId?: string | string[] }>;
};

function getRequestId(searchParams: { requestId?: string | string[] }) {
  const value = searchParams.requestId;

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getAIResultTitle(input: {
  documentTitle: string;
  resultMode: string | undefined;
}) {
  if (input.resultMode === "translation") {
    return `${input.documentTitle} - Translation`;
  }

  if (input.resultMode === "summary") {
    return `${input.documentTitle} - Summary`;
  }

  return `${input.documentTitle} - AI Result`;
}

export default async function ExportPage({
  params,
  searchParams,
}: ExportPageProps) {
  const { id } = await params;
  const requestId = getRequestId(await searchParams);
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  const document = await getDocumentForUser(userId, id);

  if (!document) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  let exportDocument = document;

  if (requestId) {
    const preview = await getAIRequestPreview(supabase, {
      userId,
      documentId: id,
      requestId,
    });
    const revisedMarkdown = preview?.output.revisedMarkdown?.trim();

    if (!preview || !revisedMarkdown) {
      notFound();
    }

    exportDocument = {
      ...document,
      title: getAIResultTitle({
        documentTitle: preview.documentTitle,
        resultMode: preview.output.resultMode,
      }),
      currentMarkdown: revisedMarkdown,
      wordCount: countWords(revisedMarkdown),
    };
  }

  const improvementSummary = await getAppliedSuggestionSummary(
    supabase,
    {
      userId,
      documentId: id,
    },
  );

  return (
    <ExportWorkspace
      document={exportDocument}
      aiRequestId={requestId}
      improvementSummary={improvementSummary}
    />
  );
}
