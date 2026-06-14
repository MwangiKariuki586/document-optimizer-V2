import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, TablesInsert } from "@/lib/supabase/types";

export type VersionSource =
  | "upload"
  | "paste"
  | "blank"
  | "manual_save"
  | "ai_apply"
  | "suggestion_apply"
  | "restore";

type CreateVersionInput = {
  documentId: string;
  userId: string;
  title: string;
  source: VersionSource;
  contentMarkdown?: string | null;
  editorJson?: Json | null;
  formattingMetadata?: Json;
  notes?: string | null;
};

export async function createDocumentVersion(
  supabase: SupabaseClient<Database>,
  input: CreateVersionInput,
): Promise<{ id: string }> {
  const payload: TablesInsert<"document_versions"> = {
    document_id: input.documentId,
    user_id: input.userId,
    title: input.title,
    source: input.source,
    content_markdown: input.contentMarkdown ?? null,
    editor_json: input.editorJson ?? null,
    formatting_metadata: input.formattingMetadata ?? {},
    notes: input.notes ?? null,
  };

  const { data, error } = await supabase
    .from("document_versions")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create document version");
  }

  return { id: data.id };
}
