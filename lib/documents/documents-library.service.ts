import { createSupabaseServerClient } from "@/lib/supabase/server";
import { removeOriginalFile } from "@/lib/storage/storage.service";

export type DocumentsLibraryItem = {
  id: string;
  title: string;
  fileType: string;
  status: string;
  fidelityStatus: string;
  wordCount: number;
  updatedAt: string;
  createdAt: string;
  sourceType: string;
  pendingSuggestionsCount: number;
};

export type DocumentsLibrarySummary = {
  total: number;
  ready: number;
  suggestionsPending: number;
  formattingReview: number;
};

export type DocumentsLibraryTabCounts = {
  all: number;
  needsReview: number;
  suggestionsReady: number;
  readyToExport: number;
  archived: number;
};

export type DocumentsLibraryResult = {
  documents: DocumentsLibraryItem[];
  total: number;
  page: number;
  pageSize: number;
  summary: DocumentsLibrarySummary;
  tabCounts: DocumentsLibraryTabCounts;
};

export type DocumentsLibraryParams = {
  userId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  type?: string;
  fidelity?: string;
  sort?: string;
  tab?: string;
};

const SORT_COLUMN_MAP: Record<string, { column: string; ascending: boolean }> =
  {
    lastUpdated: { column: "updated_at", ascending: false },
    name: { column: "title", ascending: true },
    wordCount: { column: "word_count", ascending: false },
    createdDate: { column: "created_at", ascending: false },
  };

function fileTypeToDbValue(type: string): string {
  if (type === "markdown") return "markdown";
  if (type === "blank") return "__blank__";
  return type.toLowerCase();
}

export async function getDocumentsLibrary(
  params: DocumentsLibraryParams,
): Promise<DocumentsLibraryResult> {
  const supabase = createSupabaseServerClient();
  const {
    userId,
    page,
    pageSize,
    search,
    status,
    type,
    fidelity,
    sort,
    tab,
  } = params;

  // Fetch all pending-suggestion document IDs for this user once.
  // Used for the suggestions-ready tab and suggestion counts.
  const { data: pendingSuggRows } = await supabase
    .from("suggestions")
    .select("document_id")
    .eq("user_id", userId)
    .eq("status", "pending");

  const pendingSuggMap = new Map<string, number>();
  for (const row of pendingSuggRows ?? []) {
    pendingSuggMap.set(
      row.document_id,
      (pendingSuggMap.get(row.document_id) ?? 0) + 1,
    );
  }
  const docsWithSuggestionIds = Array.from(pendingSuggMap.keys());

  // --- Summary card counts (all non-archived docs, no filter applied)
  const [
    { count: totalNonArchivedCount },
    { count: readyCount },
    { count: formattingReviewCount },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "archived"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ready"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("fidelity_status", "Formatting Review Needed"),
  ]);

  const summary: DocumentsLibrarySummary = {
    total: totalNonArchivedCount ?? 0,
    ready: readyCount ?? 0,
    suggestionsPending: docsWithSuggestionIds.length,
    formattingReview: formattingReviewCount ?? 0,
  };

  // --- Tab counts
  const [
    { count: needsReviewCount },
    { count: readyToExportCount },
    { count: archivedCount },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["draft", "processing", "failed"]),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ready"),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "archived"),
  ]);

  const tabCounts: DocumentsLibraryTabCounts = {
    all: totalNonArchivedCount ?? 0,
    needsReview: needsReviewCount ?? 0,
    suggestionsReady: docsWithSuggestionIds.length,
    readyToExport: readyToExportCount ?? 0,
    archived: archivedCount ?? 0,
  };

  // --- Main documents query
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sortKey = sort && sort !== "suggestions" ? sort : "lastUpdated";
  const { column: sortColumn, ascending: sortAscending } =
    SORT_COLUMN_MAP[sortKey] ?? SORT_COLUMN_MAP.lastUpdated;

  let query = supabase
    .from("documents")
    .select(
      "id, title, status, file_type, fidelity_status, word_count, updated_at, created_at, source_type",
      { count: "exact" },
    )
    .eq("user_id", userId);

  // Tab filters (highest priority)
  if (tab === "archived") {
    query = query.eq("status", "archived");
  } else if (tab === "needs-review") {
    query = query.in("status", ["draft", "processing", "failed"]);
  } else if (tab === "suggestions-ready") {
    if (docsWithSuggestionIds.length === 0) {
      return {
        documents: [],
        total: 0,
        page,
        pageSize,
        summary,
        tabCounts,
      };
    }
    query = query
      .in("id", docsWithSuggestionIds)
      .neq("status", "archived");
  } else if (tab === "ready-to-export") {
    query = query.eq("status", "ready");
  } else {
    // "all" — exclude archived
    query = query.neq("status", "archived");
  }

  // Status filter — skip when tab already enforces status
  const tabEnforcesStatus =
    tab === "archived" ||
    tab === "needs-review" ||
    tab === "ready-to-export";

  if (status && status !== "all" && !tabEnforcesStatus) {
    query = query.eq("status", status.toLowerCase());
  }

  // Type filter
  if (type && type !== "all") {
    const dbType = fileTypeToDbValue(type);
    if (dbType === "__blank__") {
      query = query.eq("source_type", "blank");
    } else {
      query = query.eq("file_type", dbType);
    }
  }

  // Fidelity filter
  if (fidelity && fidelity !== "all") {
    query = query.eq("fidelity_status", fidelity);
  }

  // Search filter
  if (search && search.trim()) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  // Sort (suggestions sort handled client-side after results)
  query = query.order(sortColumn, { ascending: sortAscending });

  // Pagination
  query = query.range(from, to);

  const {
    data: documents,
    count: documentTotal,
    error,
  } = await query;

  if (error) {
    console.error("[documents-library/list]", error.message);
    throw new Error("Failed to load documents");
  }

  const mapped = (documents ?? []).map((doc): DocumentsLibraryItem => ({
    id: doc.id,
    title: doc.title,
    fileType: doc.file_type,
    status: doc.status,
    fidelityStatus: doc.fidelity_status,
    wordCount: doc.word_count,
    updatedAt: doc.updated_at,
    createdAt: doc.created_at,
    sourceType: doc.source_type,
    pendingSuggestionsCount: pendingSuggMap.get(doc.id) ?? 0,
  }));

  // Sort by suggestions count if requested
  if (sort === "suggestions") {
    mapped.sort(
      (a, b) => b.pendingSuggestionsCount - a.pendingSuggestionsCount,
    );
  }

  return {
    documents: mapped,
    total: documentTotal ?? 0,
    page,
    pageSize,
    summary,
    tabCounts,
  };
}

export function getEmptyDocumentsLibrary(): DocumentsLibraryResult {
  return {
    documents: [],
    total: 0,
    page: 1,
    pageSize: 10,
    summary: { total: 0, ready: 0, suggestionsPending: 0, formattingReview: 0 },
    tabCounts: {
      all: 0,
      needsReview: 0,
      suggestionsReady: 0,
      readyToExport: 0,
      archived: 0,
    },
  };
}

// ─── Rename ────────────────────────────────────────────────────────────────────

export async function renameDocument(
  userId: string,
  documentId: string,
  title: string,
): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .update({ title: title.trim(), updated_at: new Date().toISOString() })
    .eq("id", documentId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[documents/rename]", error.message);
    throw new Error("Failed to rename document");
  }

  return data ? { id: data.id } : null;
}

// ─── Archive / Restore ─────────────────────────────────────────────────────────

export async function archiveDocument(
  userId: string,
  documentId: string,
): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", documentId)
    .eq("user_id", userId)
    .neq("status", "archived")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[documents/archive]", error.message);
    throw new Error("Failed to archive document");
  }

  return data ? { id: data.id } : null;
}

export async function restoreDocument(
  userId: string,
  documentId: string,
): Promise<{ id: string } | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("documents")
    .update({ status: "ready", updated_at: new Date().toISOString() })
    .eq("id", documentId)
    .eq("user_id", userId)
    .eq("status", "archived")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[documents/restore]", error.message);
    throw new Error("Failed to restore document");
  }

  return data ? { id: data.id } : null;
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteDocument(
  userId: string,
  documentId: string,
): Promise<boolean> {
  const supabase = createSupabaseServerClient();

  const { data: document, error: loadError } = await supabase
    .from("documents")
    .select("id,original_file_key")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (loadError) {
    console.error("[documents/delete/load]", loadError.message);
    throw new Error("Failed to delete document");
  }

  if (!document) return false;

  const { error: ingestionError } = await supabase
    .from("document_ingestions")
    .delete()
    .eq("document_id", documentId)
    .eq("user_id", userId);

  if (ingestionError) {
    console.error("[documents/delete/ingestion]", ingestionError.message);
    throw new Error("Failed to delete document");
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    console.error("[documents/delete]", error.message);
    throw new Error("Failed to delete document");
  }

  if (document.original_file_key) {
    await removeOriginalFile(supabase, document.original_file_key);
  }

  return true;
}
