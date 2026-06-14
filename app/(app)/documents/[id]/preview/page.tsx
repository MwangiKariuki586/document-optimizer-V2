import Link from "next/link";
import { notFound } from "next/navigation";

import { AIResultPreview } from "@/components/ai/AIResultPreview";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getAIRequestPreview } from "@/lib/ai/ai.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AIResultPreviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ requestId?: string }>;
};

export default async function AIResultPreviewPage({
  params,
  searchParams,
}: AIResultPreviewPageProps) {
  const { id } = await params;
  const { requestId } = await searchParams;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  if (!requestId) {
    return (
      <main className="flex-1 bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <EmptyState
            title="No AI result selected"
            description="Run an AI action from the editor, then open the saved result preview."
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
  const preview = await getAIRequestPreview(supabase, {
    userId,
    documentId: id,
    requestId,
  });

  if (!preview) {
    return (
      <main className="flex-1 bg-background px-4 py-8 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <ErrorState
            title="AI result unavailable"
            description="This AI result may still be processing, failed, or does not belong to this document."
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

  return <AIResultPreview preview={preview} />;
}
