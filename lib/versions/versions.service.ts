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

export type VersionListItem = {
  versionNumber: number;
  source: VersionSource;
  createdAt: string;
  title: string;
};

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
): Promise<{ id: string; versionNumber: number }> {
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

  // version_number is assigned by the set_document_version_number trigger.
  const { data, error } = await supabase
    .from("document_versions")
    .insert(payload)
    .select("id,version_number")
    .single();

  if (error || !data) {
    throw new Error("Failed to create document version");
  }

  return { id: data.id, versionNumber: data.version_number };
}

// Lists all versions for a document, scoped to the owner. Ordered newest first.
export async function listDocumentVersions(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<VersionListItem[]> {
  const { data, error } = await supabase
    .from("document_versions")
    .select("version_number,source,created_at,title")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("[versions/list]", error.message);
    throw new Error("Failed to list document versions");
  }

  return (data ?? []).map((row) => ({
    versionNumber: row.version_number,
    source: row.source as VersionSource,
    createdAt: row.created_at,
    title: row.title,
  }));
}

type SnapshotVersionInput = {
  documentId: string;
  userId: string;
  source: VersionSource;
  notes?: string | null;
};

// Single entry point for "version safety": snapshots a document's CURRENT stored
// state into document_versions before a destructive operation overwrites it (AI
// apply, suggestion apply, restore, etc.). Ownership is enforced by scoping the
// read to the user's row; returns null when no owned document matched.
//
// Call this BEFORE writing the new content so the snapshot captures the
// pre-change state. Wired into the AI-apply (Phase 5), suggestion-apply
// (Phase 6), and restore (Phase 7) flows.
export async function snapshotDocumentVersion(
  supabase: SupabaseClient<Database>,
  input: SnapshotVersionInput,
): Promise<{ id: string; versionNumber: number } | null> {
  const { data: document, error } = await supabase
    .from("documents")
    .select("title,current_markdown,editor_json,formatting_metadata")
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    console.error("[versions/snapshot]", error.message);
    throw new Error("Failed to snapshot document version");
  }

  if (!document) {
    return null;
  }

  return createDocumentVersion(supabase, {
    documentId: input.documentId,
    userId: input.userId,
    title: document.title,
    source: input.source,
    contentMarkdown: document.current_markdown,
    editorJson: document.editor_json,
    formattingMetadata: document.formatting_metadata,
    notes: input.notes ?? null,
  });
}
