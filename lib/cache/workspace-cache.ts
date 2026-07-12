import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import {
  getDashboardData,
  type DashboardData,
} from "@/lib/dashboard/dashboard.service";
import {
  getDocumentForUser,
} from "@/lib/documents/document.service";
import type { EditorDocument } from "@/lib/documents/document.types";
import {
  getDocumentsLibrary,
  type DocumentsLibraryParams,
  type DocumentsLibraryResult,
} from "@/lib/documents/documents-library.service";
import {
  listDocumentAIActionRuns,
} from "@/lib/ai/ai.service";
import type { AIActionRun } from "@/lib/ai/ai.types";
import {
  listDocumentSuggestions,
} from "@/lib/suggestions/suggestions.service";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const WORKSPACE_CACHE_REVALIDATE_SECONDS = 60;
export const DOCUMENTS_LIBRARY_CACHE_REVALIDATE_SECONDS = 300;

export function workspaceCacheTag(userId: string): string {
  return `workspace:${userId}`;
}

export function dashboardCacheTag(userId: string): string {
  return `dashboard:${userId}`;
}

export function documentsLibraryCacheTag(userId: string): string {
  return `documents-library:${userId}`;
}

export function documentEditorCacheTag(
  userId: string,
  documentId: string,
): string {
  return `document-editor:${userId}:${documentId}`;
}

export function documentsLibraryCacheKey(
  params: DocumentsLibraryParams,
): string[] {
  return [
    "documents-library",
    params.userId,
    String(params.page),
    String(params.pageSize),
    params.search ?? "",
    params.status ?? "",
    params.type ?? "",
    params.fidelity ?? "",
    params.sort ?? "",
    params.tab ?? "",
  ];
}

export function documentEditorCacheKey(
  userId: string,
  documentId: string,
): string[] {
  return ["document-editor", userId, documentId];
}

export type CachedDocumentEditorData = {
  document: EditorDocument | null;
  initialSuggestions: DocumentSuggestion[];
  initialAIActionRuns: AIActionRun[];
};

export async function getCachedDashboardData(
  userId: string,
): Promise<DashboardData> {
  return unstable_cache(
    () => getDashboardData(userId),
    ["dashboard", userId],
    {
      revalidate: WORKSPACE_CACHE_REVALIDATE_SECONDS,
      tags: [workspaceCacheTag(userId), dashboardCacheTag(userId)],
    },
  )();
}

export async function getCachedDocumentEditorData(
  userId: string,
  documentId: string,
): Promise<CachedDocumentEditorData> {
  return unstable_cache(
    async () => {
      const document = await getDocumentForUser(userId, documentId);

      if (!document) {
        return {
          document: null,
          initialSuggestions: [],
          initialAIActionRuns: [],
        };
      }

      const supabase = createSupabaseServerClient();
      const [initialSuggestions, initialAIActionRuns] = await Promise.all([
        listDocumentSuggestions(supabase, userId, documentId),
        listDocumentAIActionRuns(supabase, userId, documentId),
      ]);

      return {
        document,
        initialSuggestions: initialSuggestions ?? [],
        initialAIActionRuns,
      };
    },
    documentEditorCacheKey(userId, documentId),
    {
      revalidate: WORKSPACE_CACHE_REVALIDATE_SECONDS,
      tags: [
        workspaceCacheTag(userId),
        documentsLibraryCacheTag(userId),
        documentEditorCacheTag(userId, documentId),
      ],
    },
  )();
}

export async function getCachedDocumentsLibrary(
  params: DocumentsLibraryParams,
): Promise<DocumentsLibraryResult> {
  return unstable_cache(
    () => getDocumentsLibrary(params),
    documentsLibraryCacheKey(params),
    {
      revalidate: DOCUMENTS_LIBRARY_CACHE_REVALIDATE_SECONDS,
      tags: [
        workspaceCacheTag(params.userId),
        documentsLibraryCacheTag(params.userId),
      ],
    },
  )();
}

export type WorkspaceCacheScope = "all" | "dashboard" | "documents-library";

export function invalidateWorkspaceCache(
  userId: string,
  scope: WorkspaceCacheScope = "all",
): void {
  const tags =
    scope === "dashboard"
      ? [workspaceCacheTag(userId), dashboardCacheTag(userId)]
      : scope === "documents-library"
        ? [workspaceCacheTag(userId), documentsLibraryCacheTag(userId)]
        : [
            workspaceCacheTag(userId),
            dashboardCacheTag(userId),
            documentsLibraryCacheTag(userId),
          ];

  for (const tag of new Set(tags)) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch (error) {
      console.error("[workspace-cache/invalidate]", { tag, error });
    }
  }
}

export function invalidateDocumentCache(
  userId: string,
  documentId: string,
): void {
  invalidateWorkspaceCache(userId);

  try {
    revalidateTag(documentEditorCacheTag(userId, documentId), { expire: 0 });
  } catch (error) {
    console.error("[workspace-cache/invalidate]", {
      tag: documentEditorCacheTag(userId, documentId),
      error,
    });
  }
}
