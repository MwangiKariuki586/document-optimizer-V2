import { notFound } from "next/navigation";

import { VersionHistoryWorkspace } from "@/components/versions/VersionHistoryWorkspace";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentForUser } from "@/lib/documents/document.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listDocumentVersions } from "@/lib/versions/versions.service";

type VersionHistoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function VersionHistoryPage({
  params,
}: VersionHistoryPageProps) {
  const { id } = await params;
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    notFound();
  }

  const document = await getDocumentForUser(userId, id);

  if (!document) {
    notFound();
  }

  const supabase = createSupabaseServerClient();
  const versions = await listDocumentVersions(supabase, userId, id);

  return <VersionHistoryWorkspace document={document} versions={versions} />;
}
