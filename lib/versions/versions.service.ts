import type { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { countWords, plainTextToEditorJson } from "@/lib/documents/text-to-editor";
import { recordUsageEvent } from "@/lib/usage/usage.service";
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
  id: string;
  versionNumber: number;
  source: VersionSource;
  createdAt: string;
  title: string;
  notes: string | null;
  contentMarkdown: string;
  editorJson: Json | null;
  formattingMetadata: Json;
};

export type RestoreVersionResult = {
  documentId: string;
  selectedVersionNumber: number;
  restoredVersionNumber: number;
  currentMarkdown: string;
  editorJson: Json;
  wordCount: number;
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
    .select(
      "id,version_number,source,created_at,title,notes,content_markdown,editor_json,formatting_metadata",
    )
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("[versions/list]", error.message);
    throw new Error("Failed to list document versions");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    versionNumber: row.version_number,
    source: row.source as VersionSource,
    createdAt: row.created_at,
    title: row.title,
    notes: row.notes,
    contentMarkdown: row.content_markdown ?? "",
    editorJson: row.editor_json,
    formattingMetadata: row.formatting_metadata,
  }));
}

export async function restoreDocumentVersion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    versionNumber: number;
  },
): Promise<RestoreVersionResult | null> {
  const { data: version, error: versionError } = await supabase
    .from("document_versions")
    .select("version_number,content_markdown,editor_json,formatting_metadata,title")
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("version_number", input.versionNumber)
    .maybeSingle();

  if (versionError) {
    console.error("[versions/restore/load]", versionError.message);
    throw new Error("Failed to load version");
  }

  if (!version) {
    return null;
  }

  await snapshotDocumentVersion(supabase, {
    documentId: input.documentId,
    userId: input.userId,
    source: "restore",
    notes: `Auto-saved before restoring version ${input.versionNumber}`,
  });

  const restoredMarkdown = version.content_markdown ?? "";
  const restoredEditorJson =
    version.editor_json ?? plainTextToEditorJson(restoredMarkdown);
  const wordCount = countWords(restoredMarkdown);

  const { data: document, error: updateError } = await supabase
    .from("documents")
    .update({
      current_markdown: restoredMarkdown,
      editor_json: restoredEditorJson,
      formatting_metadata: version.formatting_metadata,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[versions/restore/update]", updateError.message);
    throw new Error("Failed to restore version");
  }

  if (!document) {
    return null;
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "version_restore",
    documentId: document.id,
    metadata: {
      selectedVersionNumber: version.version_number,
      restoredVersionNumber: version.version_number,
    },
  });

  return {
    documentId: document.id,
    selectedVersionNumber: version.version_number,
    restoredVersionNumber: version.version_number,
    currentMarkdown: restoredMarkdown,
    editorJson: restoredEditorJson,
    wordCount,
  };
}

type SnapshotVersionInput = {
  documentId: string;
  userId: string;
  source: VersionSource;
  notes?: string | null;
};

type SnapshotScope = "ai_request";

type MutationSnapshotInput = {
  documentId: string;
  userId: string;
  title: string;
  source: VersionSource;
  contentMarkdown: string | null;
  editorJson: Json | null;
  formattingMetadata: Json;
  notes?: string | null;
  scope?: SnapshotScope;
  scopeId?: string | null;
};

export type MutationSnapshotResult = {
  id: string;
  versionNumber: number;
  sessionId: string | null;
  reused: boolean;
};

type SnapshotSessionRow = {
  id: string;
  version_id: string;
  last_content_hash: string;
  expires_at: string;
};

export function getDocumentContentHash(input: {
  contentMarkdown: string | null;
  editorJson: Json | null;
}): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        contentMarkdown: input.contentMarkdown ?? "",
        editorJson: input.editorJson ?? null,
      }),
    )
    .digest("hex");
}

// Single entry point for "version safety": snapshots a document's CURRENT stored
// state into document_versions before a destructive operation overwrites it (AI
// apply, suggestion apply, etc.). Ownership is enforced by scoping the
// read to the user's row; returns null when no owned document matched.
//
// Call this BEFORE writing the new content so the snapshot captures the
// pre-change state. Wired into the AI-apply (Phase 5), suggestion-apply
// (Phase 6), and other flows that intentionally create a recoverable snapshot.
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

async function closeSnapshotSession(
  supabase: SupabaseClient<Database>,
  input: {
    sessionId: string;
    userId: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("document_snapshot_sessions")
    .update({
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .eq("user_id", input.userId);

  if (error) {
    console.error("[versions/snapshot-session/close]", error.message);
  }
}

async function getSessionVersion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    versionId: string;
  },
): Promise<{ id: string; versionNumber: number } | null> {
  const { data, error } = await supabase
    .from("document_versions")
    .select("id,version_number")
    .eq("id", input.versionId)
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    console.error("[versions/snapshot-session/version]", error.message);
    throw new Error("Failed to load snapshot version");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    versionNumber: data.version_number,
  };
}

export async function updateMutationSnapshotSessionHash(
  supabase: SupabaseClient<Database>,
  input: {
    sessionId: string | null;
    userId: string;
    contentMarkdown: string | null;
    editorJson: Json | null;
  },
): Promise<void> {
  if (!input.sessionId) {
    return;
  }

  const { error } = await supabase
    .from("document_snapshot_sessions")
    .update({
      last_content_hash: getDocumentContentHash(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .is("closed_at", null);

  if (error) {
    console.error("[versions/snapshot-session/hash]", error.message);
  }
}

export async function getOrCreateMutationSnapshot(
  supabase: SupabaseClient<Database>,
  input: MutationSnapshotInput,
): Promise<MutationSnapshotResult | null> {
  if (!input.scope || !input.scopeId) {
    const version = await createDocumentVersion(supabase, {
      documentId: input.documentId,
      userId: input.userId,
      title: input.title,
      source: input.source,
      contentMarkdown: input.contentMarkdown,
      editorJson: input.editorJson,
      formattingMetadata: input.formattingMetadata,
      notes: input.notes ?? null,
    });

    return { ...version, sessionId: null, reused: false };
  }

  const currentHash = getDocumentContentHash(input);
  const { data: existingSession, error: sessionError } = await supabase
    .from("document_snapshot_sessions")
    .select("id,version_id,last_content_hash,expires_at")
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("source", input.source)
    .eq("scope", input.scope)
    .eq("scope_id", input.scopeId)
    .is("closed_at", null)
    .maybeSingle();

  if (sessionError) {
    console.error("[versions/snapshot-session/get]", sessionError.message);
    throw new Error("Failed to load snapshot session");
  }

  if (existingSession) {
    const session = existingSession as SnapshotSessionRow;
    const isFresh = new Date(session.expires_at).getTime() > Date.now();

    if (isFresh && session.last_content_hash === currentHash) {
      const version = await getSessionVersion(supabase, {
        userId: input.userId,
        documentId: input.documentId,
        versionId: session.version_id,
      });

      if (version) {
        return {
          id: version.id,
          versionNumber: version.versionNumber,
          sessionId: session.id,
          reused: true,
        };
      }
    }

    await closeSnapshotSession(supabase, {
      sessionId: session.id,
      userId: input.userId,
    });
  }

  const version = await createDocumentVersion(supabase, {
    documentId: input.documentId,
    userId: input.userId,
    title: input.title,
    source: input.source,
    contentMarkdown: input.contentMarkdown,
    editorJson: input.editorJson,
    formattingMetadata: input.formattingMetadata,
    notes: input.notes ?? null,
  });

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const { data: createdSession, error: createSessionError } = await supabase
    .from("document_snapshot_sessions")
    .insert({
      user_id: input.userId,
      document_id: input.documentId,
      source: input.source,
      scope: input.scope,
      scope_id: input.scopeId,
      version_id: version.id,
      base_content_hash: currentHash,
      last_content_hash: currentHash,
      expires_at: expiresAt,
    })
    .select("id")
    .maybeSingle();

  if (createSessionError) {
    console.error(
      "[versions/snapshot-session/create]",
      createSessionError.message,
    );
    return { ...version, sessionId: null, reused: false };
  }

  return {
    ...version,
    sessionId: createdSession?.id ?? null,
    reused: false,
  };
}
