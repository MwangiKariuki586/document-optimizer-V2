import Link from "next/link";
import { notFound } from "next/navigation";

import { AIResultPreview } from "@/components/ai/AIResultPreview";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getAIRequestPreview } from "@/lib/ai/ai.service";
import {
  getSuggestionPreview,
  getSuggestionSelectionPreview,
} from "@/lib/suggestions/suggestions.service";
import { suggestionPreviewSearchParamsSchema } from "@/lib/suggestions/suggestions.validators";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AIResultPreviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    requestId?: string;
    suggestionId?: string;
    selectionId?: string;
  }>;
};

export default async function AIResultPreviewPage({
  params,
  searchParams,
}: AIResultPreviewPageProps) {
  const { id } = await params;
  const rawSearchParams = await searchParams;
  const parsedSearchParams =
    suggestionPreviewSearchParamsSchema.safeParse(rawSearchParams);
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  if (!parsedSearchParams.success) {
    return (
      <main className="flex-1 bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <EmptyState
            title="No preview selected"
            description="Run an AI action or choose a suggestion from the editor, then open the saved preview."
            action={
              <Link
                href={`/documents/${id}`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
              >
                Back to editor
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const supabase = createSupabaseServerClient();
  const source = parsedSearchParams.data;
  const preview = source.requestId
    ? {
        kind: "ai_request" as const,
        data: await getAIRequestPreview(supabase, {
          userId,
          documentId: id,
          requestId: source.requestId,
        }),
      }
    : source.suggestionId
      ? {
          kind: "suggestion" as const,
          data: await getSuggestionPreview(supabase, {
            userId,
            documentId: id,
            suggestionId: source.suggestionId,
          }),
        }
      : {
          kind: "suggestion" as const,
          data: await getSuggestionSelectionPreview(supabase, {
            userId,
            documentId: id,
            selectionId: source.selectionId ?? "",
          }),
        };

  if (!preview.data) {
    return (
      <main className="flex-1 bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <ErrorState
            title="Preview unavailable"
            description="This preview may be expired, already applied, still processing, or it may not belong to this document."
            action={
              <Link
                href={`/documents/${id}`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
              >
                Back to editor
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  if (preview.kind === "ai_request") {
    return (
      <AIResultPreview preview={{ kind: "ai_request", data: preview.data }} />
    );
  }

  return <AIResultPreview preview={{ kind: "suggestion", data: preview.data }} />;
}
