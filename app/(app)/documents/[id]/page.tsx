import { notFound } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentForUser } from "@/lib/documents/document.service";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";

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

  const document = await getDocumentForUser(userId, id);

  if (!document) {
    notFound();
  }

  return <EditorWorkspace document={document} />;
}
