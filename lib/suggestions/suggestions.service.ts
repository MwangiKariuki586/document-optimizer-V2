import type { SupabaseClient } from "@supabase/supabase-js";

import type { AIActionKey, AIActionOutput } from "@/lib/ai/ai.types";
import {
  applyTextReplacementsToEditorJson,
  toJson,
  type TextReplacement,
} from "@/lib/documents/editor-json";
import {
  editorJsonToMarkdown,
  markdownToEditorJson,
  markdownToPlainText,
} from "@/lib/documents/markdown-to-editor";
import {
  countWords,
} from "@/lib/documents/text-to-editor";
import {
  applyReplacementsSafely,
  getReplacementSafety,
  resolveSuggestionOriginalText,
  SuggestionReplacementError,
} from "@/lib/suggestions/suggestion-replace";
import { suggestionTypeSchema } from "@/lib/suggestions/suggestions.validators";
import type {
  ApplyAllSuggestionsResult,
  ApplySuggestionResult,
  DocumentSuggestion,
  SuggestionPreview,
  SuggestionPreviewItem,
  SuggestionStatus,
  SuggestionType,
} from "@/lib/suggestions/suggestions.types";
import type { Database, Json, TablesInsert } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import { snapshotDocumentVersion } from "@/lib/versions/versions.service";

type SuggestionRow = {
  id: string;
  document_id: string;
  ai_request_id: string | null;
  type: string;
  original_text: string;
  suggested_text: string;
  explanation: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type DocumentPreviewRow = {
  id: string;
  title: string;
  current_markdown: string | null;
  editor_json: Json | null;
};

type DocumentContentRow = {
  current_markdown: string | null;
  editor_json: Json | null;
};

type SelectionRow = {
  id: string;
  document_id: string;
  suggestion_ids: string[];
  expires_at: string;
};

const SUGGESTION_FRIENDLY_ACTIONS = new Set<AIActionKey>([
  "optimize",
  "improve_clarity",
  "fix_grammar",
  "rewrite",
  "tone_analyze",
  "seo_analyze",
  "simplify_language",
]);

function toSuggestionType(value: string): SuggestionType | null {
  if (value === "seo") {
    return "structure";
  }

  if (value === "style") {
    return "tone";
  }

  const parsed = suggestionTypeSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  if (parsed.data === "seo") {
    return "structure";
  }

  if (parsed.data === "style") {
    return "tone";
  }

  return parsed.data;
}

function toSuggestionStatus(value: string): SuggestionStatus {
  if (value === "applied" || value === "ignored") {
    return value;
  }

  return "pending";
}

function mapSuggestionRow(row: SuggestionRow): DocumentSuggestion | null {
  const type = toSuggestionType(row.type);

  if (!type) {
    return null;
  }

  return {
    id: row.id,
    documentId: row.document_id,
    aiRequestId: row.ai_request_id,
    type,
    originalText: row.original_text,
    suggestedText: row.suggested_text,
    explanation: row.explanation ?? "",
    status: toSuggestionStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function toReplacementPairs(suggestions: DocumentSuggestion[]) {
  return suggestions.map((suggestion) => ({
    originalText: suggestion.originalText,
    suggestedText: suggestion.suggestedText,
  }));
}

function getSuggestionSafety(
  currentMarkdown: string,
  suggestions: DocumentSuggestion[],
): SuggestionPreviewItem[] {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    safety: getReplacementSafety(currentMarkdown, suggestion.originalText),
  }));
}

function getSafetyWarnings(items: SuggestionPreviewItem[]): string[] {
  const hasMissing = items.some((item) => item.safety === "missing");
  const hasAmbiguous = items.some((item) => item.safety === "ambiguous");
  const warnings: string[] = [];

  if (hasMissing) {
    warnings.push(
      "One or more suggestions no longer match the current document. Regenerate suggestions or review the changed text.",
    );
  }

  if (hasAmbiguous) {
    warnings.push(
      "One or more suggestions match multiple places in the document and cannot be applied safely as a batch.",
    );
  }

  return warnings;
}

async function getOwnedDocumentContent(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<DocumentContentRow | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("current_markdown,editor_json")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[suggestions/document-content]", error.message);
    throw new Error("Failed to load document for suggestion apply");
  }

  return data as DocumentContentRow | null;
}

async function getOwnedDocumentPreview(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<DocumentPreviewRow | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,current_markdown,editor_json")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[suggestions/preview/document]", error.message);
    throw new Error("Failed to load document for suggestion preview");
  }

  return data as DocumentPreviewRow | null;
}

function buildSuggestionPreview(input: {
  kind: "single_suggestion" | "multi_suggestion";
  id: string;
  document: DocumentPreviewRow;
  suggestions: DocumentSuggestion[];
  selectionId?: string;
  expiresAt?: string;
}): SuggestionPreview {
  const originalMarkdown = input.document.current_markdown ?? "";
  const previewItems = getSuggestionSafety(originalMarkdown, input.suggestions);
  const warnings = getSafetyWarnings(previewItems);
  const canApply = warnings.length === 0 && previewItems.length > 0;
  const proposedMarkdown = canApply
    ? applyReplacementsSafely(originalMarkdown, toReplacementPairs(input.suggestions))
    : originalMarkdown;
  const proposedEditorJson = canApply
    ? buildReplacementEditorJson({
        currentEditorJson: input.document.editor_json,
        fallbackMarkdown: proposedMarkdown,
        replacements: toReplacementPairs(input.suggestions),
      })
    : input.document.editor_json;
  const count = previewItems.length;

  return {
    kind: input.kind,
    id: input.id,
    documentId: input.document.id,
    documentTitle: input.document.title,
    originalMarkdown,
    proposedMarkdown,
    originalEditorJson: input.document.editor_json,
    proposedEditorJson,
    canApply,
    summary:
      count === 1
        ? previewItems[0]?.explanation || "Review this AI suggestion before applying it."
        : `Review ${count} AI suggestions before applying them to the document.`,
    warnings,
    suggestions: previewItems,
    selectionId: input.selectionId,
    expiresAt: input.expiresAt,
  };
}

async function updateDocumentContent(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    currentMarkdown: string;
    editorJson?: Json;
  },
): Promise<{ editorJson: Json; wordCount: number } | null> {
  const editorJson = input.editorJson ?? markdownToEditorJson(input.currentMarkdown);
  const wordCount = countWords(input.currentMarkdown);

  const { data, error } = await supabase
    .from("documents")
    .update({
      current_markdown: input.currentMarkdown,
      editor_json: editorJson,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[suggestions/update-document]", error.message);
    throw new Error("Failed to update document content");
  }

  if (!data) {
    return null;
  }

  return { editorJson, wordCount };
}

function markdownReplacementToPlainText(value: string): string {
  return markdownToPlainText(value).trim() || value;
}

function toPlainTextReplacements(
  replacements: TextReplacement[],
): TextReplacement[] {
  return replacements.map((replacement) => ({
    originalText: markdownReplacementToPlainText(replacement.originalText),
    suggestedText: markdownReplacementToPlainText(replacement.suggestedText),
  }));
}

function buildReplacementEditorJson(input: {
  currentEditorJson: Json | null;
  fallbackMarkdown: string;
  replacements: TextReplacement[];
}): Json {
  const richEditorJson = applyTextReplacementsToEditorJson(
    input.currentEditorJson,
    toPlainTextReplacements(input.replacements),
  );

  if (!richEditorJson) {
    return markdownToEditorJson(input.fallbackMarkdown);
  }

  return toJson(richEditorJson);
}

function serializeEditorJsonOrFallback(
  editorJson: Json,
  fallbackMarkdown: string,
): string {
  return editorJsonToMarkdown(editorJson).trim() || fallbackMarkdown;
}

async function markSuggestionStatus(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    suggestionId: string;
    status: "applied" | "ignored";
  },
): Promise<boolean> {
  const { data, error } = await supabase
    .from("suggestions")
    .update({
      status: input.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.suggestionId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[suggestions/status]", error.message);
    throw new Error("Failed to update suggestion status");
  }

  return Boolean(data);
}

export async function saveSuggestionsFromAIResult(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    aiRequestId: string;
    action: AIActionKey;
    originalMarkdown: string;
    output: AIActionOutput;
  },
): Promise<DocumentSuggestion[]> {
  const suggestions = input.output.suggestions ?? [];
  const rows: TablesInsert<"suggestions">[] = [];
  let rejectedSuggestionCount = 0;

  console.log("[suggestions/save-from-ai] input", {
    documentId: input.documentId,
    aiRequestId: input.aiRequestId,
    action: input.action,
    outputSuggestionCount: suggestions.length,
    hasRevisedMarkdown: Boolean(input.output.revisedMarkdown),
    originalLength: input.originalMarkdown.length,
  });

  for (const suggestion of suggestions) {
    const type = toSuggestionType(suggestion.type);

    if (!type) {
      continue;
    }

    const originalText = resolveSuggestionOriginalText(
      input.originalMarkdown,
      suggestion.originalText,
    );

    if (!originalText) {
      rejectedSuggestionCount += 1;
      continue;
    }

    rows.push({
      user_id: input.userId,
      document_id: input.documentId,
      ai_request_id: input.aiRequestId,
      type,
      original_text: originalText,
      suggested_text: suggestion.suggestedText,
      explanation: suggestion.explanation,
      status: "pending",
    });
  }

  const revisedMarkdown = input.output.revisedMarkdown?.trim();
  const originalMarkdown = input.originalMarkdown.trim();

  if (
    rows.length === 0 &&
    revisedMarkdown &&
    revisedMarkdown !== originalMarkdown &&
    originalMarkdown &&
    SUGGESTION_FRIENDLY_ACTIONS.has(input.action)
  ) {
    console.log("[suggestions/save-from-ai] using fallback suggestion", {
      documentId: input.documentId,
      aiRequestId: input.aiRequestId,
      action: input.action,
    });

    rows.push({
      user_id: input.userId,
      document_id: input.documentId,
      ai_request_id: input.aiRequestId,
      type: "clarity",
      original_text: originalMarkdown,
      suggested_text: revisedMarkdown,
      explanation:
        "AI returned a revised version without individual suggestions, so this full-document suggestion was created for preview-first review.",
      status: "pending",
    });
  }

  if (rows.length === 0) {
    console.log("[suggestions/save-from-ai] no rows to insert", {
      documentId: input.documentId,
      aiRequestId: input.aiRequestId,
      action: input.action,
      rejectedSuggestionCount,
    });

    return [];
  }

  const { data, error } = await supabase
    .from("suggestions")
    .insert(rows)
    .select(
      "id,document_id,ai_request_id,type,original_text,suggested_text,explanation,status,created_at,updated_at",
    );

  if (error) {
    console.error("[suggestions/save-from-ai]", error.message);
    throw new Error("Failed to save AI suggestions");
  }

  const saved = (data ?? [])
    .map(mapSuggestionRow)
    .filter((row): row is DocumentSuggestion => row !== null);

  console.log("[suggestions/save-from-ai] inserted", {
    documentId: input.documentId,
    aiRequestId: input.aiRequestId,
    count: saved.length,
    rejectedSuggestionCount,
  });

  return saved;
}

export async function listDocumentSuggestions(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<DocumentSuggestion[] | null> {
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (documentError) {
    console.error("[suggestions/list/document]", documentError.message);
    throw new Error("Failed to verify document ownership");
  }

  if (!document) {
    return null;
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,document_id,ai_request_id,type,original_text,suggested_text,explanation,status,created_at,updated_at",
    )
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[suggestions/list]", error.message);
    throw new Error("Failed to load suggestions");
  }

  return (data ?? [])
    .map((row) => mapSuggestionRow(row as SuggestionRow))
    .filter((row): row is DocumentSuggestion => row !== null);
}

async function getOwnedPendingSuggestion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionId: string;
  },
): Promise<SuggestionRow | null> {
  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,document_id,ai_request_id,type,original_text,suggested_text,explanation,status,created_at,updated_at",
    )
    .eq("id", input.suggestionId)
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error("[suggestions/get]", error.message);
    throw new Error("Failed to load suggestion");
  }

  return data as SuggestionRow | null;
}

async function getOwnedPendingSuggestionsByIds(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionIds: string[];
  },
): Promise<DocumentSuggestion[] | null> {
  const ids = uniqueIds(input.suggestionIds);

  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,document_id,ai_request_id,type,original_text,suggested_text,explanation,status,created_at,updated_at",
    )
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .in("id", ids)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[suggestions/get-selected]", error.message);
    throw new Error("Failed to load selected suggestions");
  }

  const suggestions = (data ?? [])
    .map((row) => mapSuggestionRow(row as SuggestionRow))
    .filter((row): row is DocumentSuggestion => row !== null);

  if (suggestions.length !== ids.length) {
    return null;
  }

  return suggestions;
}

async function getOwnedAppliedSuggestions(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
  },
): Promise<DocumentSuggestion[] | null> {
  const { data, error } = await supabase
    .from("suggestions")
    .select(
      "id,document_id,ai_request_id,type,original_text,suggested_text,explanation,status,created_at,updated_at",
    )
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "applied")
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("[suggestions/get-applied]", error.message);
    throw new Error("Failed to load applied suggestions");
  }

  return (data ?? [])
    .map((row) => mapSuggestionRow(row as SuggestionRow))
    .filter((row): row is DocumentSuggestion => row !== null);
}

export async function getSuggestionPreview(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionId: string;
  },
): Promise<SuggestionPreview | null> {
  const [document, suggestion] = await Promise.all([
    getOwnedDocumentPreview(supabase, input.userId, input.documentId),
    getOwnedPendingSuggestion(supabase, input),
  ]);

  if (!document || !suggestion) {
    return null;
  }

  const mapped = mapSuggestionRow(suggestion);

  if (!mapped) {
    return null;
  }

  return buildSuggestionPreview({
    kind: "single_suggestion",
    id: input.suggestionId,
    document,
    suggestions: [mapped],
  });
}

async function getOwnedActiveSelection(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    selectionId: string;
  },
): Promise<SelectionRow | null> {
  const { data, error } = await supabase
    .from("suggestion_preview_selections")
    .select("id,document_id,suggestion_ids,expires_at")
    .eq("id", input.selectionId)
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[suggestions/selection/get]", error.message);
    throw new Error("Failed to load suggestion selection");
  }

  return data as SelectionRow | null;
}

export async function createSuggestionPreviewSelection(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionIds: string[];
  },
): Promise<{ selectionId: string; expiresAt: string } | null> {
  const ids = uniqueIds(input.suggestionIds);
  const suggestions = await getOwnedPendingSuggestionsByIds(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    suggestionIds: ids,
  });

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const { error: cleanupError } = await supabase
    .from("suggestion_preview_selections")
    .delete()
    .eq("user_id", input.userId)
    .eq("document_id", input.documentId)
    .lt("expires_at", now);

  if (cleanupError) {
    console.error("[suggestions/selection/cleanup]", cleanupError.message);
    throw new Error("Failed to prepare suggestion selection");
  }

  const { data, error } = await supabase
    .from("suggestion_preview_selections")
    .insert({
      user_id: input.userId,
      document_id: input.documentId,
      suggestion_ids: ids,
    })
    .select("id,expires_at")
    .maybeSingle();

  if (error) {
    console.error("[suggestions/selection/create]", error.message);
    throw new Error("Failed to create suggestion selection");
  }

  if (!data) {
    return null;
  }

  return {
    selectionId: data.id,
    expiresAt: data.expires_at,
  };
}

export async function getSuggestionSelectionPreview(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    selectionId: string;
  },
): Promise<SuggestionPreview | null> {
  const [document, selection] = await Promise.all([
    getOwnedDocumentPreview(supabase, input.userId, input.documentId),
    getOwnedActiveSelection(supabase, input),
  ]);

  if (!document || !selection) {
    return null;
  }

  const suggestions = await getOwnedPendingSuggestionsByIds(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    suggestionIds: selection.suggestion_ids,
  });

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return buildSuggestionPreview({
    kind: "multi_suggestion",
    id: selection.id,
    document,
    suggestions,
    selectionId: selection.id,
    expiresAt: selection.expires_at,
  });
}

export async function getAppliedSuggestionsPreview(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
  },
): Promise<SuggestionPreview | null> {
  const [document, suggestions] = await Promise.all([
    getOwnedDocumentPreview(supabase, input.userId, input.documentId),
    getOwnedAppliedSuggestions(supabase, input),
  ]);

  if (!document || !suggestions || suggestions.length === 0) {
    return null;
  }

  const currentMarkdown = document.current_markdown ?? "";
  const previewItems = suggestions.map((suggestion) => ({
    ...suggestion,
    safety: getReplacementSafety(currentMarkdown, suggestion.suggestedText),
  }));
  const unsafeItems = previewItems.filter((item) => item.safety !== "safe");
  const originalMarkdown =
    unsafeItems.length === 0
      ? applyReplacementsSafely(
          currentMarkdown,
          suggestions.map((suggestion) => ({
            originalText: suggestion.suggestedText,
            suggestedText: suggestion.originalText,
          })),
        )
      : currentMarkdown;
  const warnings =
    unsafeItems.length > 0
      ? [
          "Some applied suggestions no longer match the current document exactly, so the before view may match the current document.",
        ]
      : [];

  return {
    kind: "applied_suggestions",
    id: `${document.id}-applied`,
    documentId: document.id,
    documentTitle: document.title,
    originalMarkdown,
    proposedMarkdown: currentMarkdown,
    originalEditorJson: markdownToEditorJson(originalMarkdown),
    proposedEditorJson: document.editor_json,
    canApply: false,
    summary: `Review ${suggestions.length} applied AI suggestion${
      suggestions.length === 1 ? "" : "s"
    } against the current document.`,
    warnings,
    suggestions: previewItems,
    readOnly: true,
  };
}

export async function applySuggestion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionId: string;
    editedMarkdown?: string;
  },
): Promise<ApplySuggestionResult | null> {
  const [suggestion, document] = await Promise.all([
    getOwnedPendingSuggestion(supabase, input),
    getOwnedDocumentContent(supabase, input.userId, input.documentId),
  ]);

  if (!suggestion || !document) {
    return null;
  }

  const currentMarkdown = document.current_markdown ?? "";
  const editedMarkdown = input.editedMarkdown?.trim();
  const editedBeforeApply = Boolean(editedMarkdown);

  if (!editedBeforeApply) {
    const safety = getReplacementSafety(
      currentMarkdown,
      suggestion.original_text,
    );

    if (safety !== "safe") {
      throw new SuggestionReplacementError(
        safety === "missing"
          ? "This suggestion no longer matches the document. Review it individually or regenerate suggestions."
          : "This suggestion matches multiple places in the document. Apply it individually after reviewing the text.",
      );
    }
  }

  const fallbackMarkdown =
    editedMarkdown ??
    applyReplacementsSafely(currentMarkdown, [
      {
        originalText: suggestion.original_text,
        suggestedText: suggestion.suggested_text,
      },
    ]);
  const nextEditorJson = editedMarkdown
    ? markdownToEditorJson(fallbackMarkdown)
    : buildReplacementEditorJson({
        currentEditorJson: document.editor_json,
        fallbackMarkdown,
        replacements: [
          {
            originalText: suggestion.original_text,
            suggestedText: suggestion.suggested_text,
          },
        ],
      });
  const nextMarkdown = serializeEditorJsonOrFallback(
    nextEditorJson,
    fallbackMarkdown,
  );

  const snapshot = await snapshotDocumentVersion(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    source: "suggestion_apply",
    notes: editedBeforeApply
      ? "AI suggestion result edited before apply"
      : `Before applying suggestion ${input.suggestionId}`,
  });

  if (!snapshot) {
    return null;
  }

  const updated = await updateDocumentContent(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    currentMarkdown: nextMarkdown,
    editorJson: nextEditorJson,
  });

  if (!updated) {
    return null;
  }

  const marked = await markSuggestionStatus(supabase, {
    userId: input.userId,
    suggestionId: input.suggestionId,
    status: "applied",
  });

  if (!marked) {
    throw new Error("Failed to mark suggestion as applied");
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "suggestion_apply",
    documentId: input.documentId,
    metadata: {
      suggestionId: input.suggestionId,
      versionNumber: snapshot.versionNumber,
      appliedCount: 1,
      editedBeforeApply,
    },
  });

  return {
    documentId: input.documentId,
    suggestionId: input.suggestionId,
    versionNumber: snapshot.versionNumber,
    currentMarkdown: nextMarkdown,
    editorJson: updated.editorJson,
    wordCount: updated.wordCount,
  };
}

export async function ignoreSuggestion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionId: string;
  },
): Promise<{ suggestionId: string } | null> {
  const suggestion = await getOwnedPendingSuggestion(supabase, input);

  if (!suggestion) {
    return null;
  }

  const marked = await markSuggestionStatus(supabase, {
    userId: input.userId,
    suggestionId: input.suggestionId,
    status: "ignored",
  });

  if (!marked) {
    return null;
  }

  return { suggestionId: input.suggestionId };
}

export async function applyPendingSuggestions(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    suggestionIds?: string[];
  },
): Promise<ApplyAllSuggestionsResult | null> {
  const suggestions = input.suggestionIds
    ? await getOwnedPendingSuggestionsByIds(supabase, {
        userId: input.userId,
        documentId: input.documentId,
        suggestionIds: input.suggestionIds,
      })
    : await listDocumentSuggestions(
        supabase,
        input.userId,
        input.documentId,
      );

  if (!suggestions) {
    return null;
  }

  const pending = suggestions.filter(
    (suggestion) => suggestion.status === "pending",
  );

  if (pending.length === 0) {
    throw new SuggestionReplacementError(
      "There are no pending suggestions to apply.",
    );
  }

  const document = await getOwnedDocumentContent(
    supabase,
    input.userId,
    input.documentId,
  );

  if (!document) {
    return null;
  }

  const currentMarkdown = document.current_markdown ?? "";

  for (const suggestion of pending) {
    const safety = getReplacementSafety(
      currentMarkdown,
      suggestion.originalText,
    );

    if (safety !== "safe") {
      throw new SuggestionReplacementError(
        safety === "missing"
          ? "One or more suggestions no longer match the document. Apply suggestions individually."
          : "One or more suggestions match multiple places in the document. Apply suggestions individually.",
      );
    }
  }

  const snapshot = await snapshotDocumentVersion(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    source: "suggestion_apply",
    notes: `Before applying ${pending.length} suggestions`,
  });

  if (!snapshot) {
    return null;
  }

  const replacements = pending.map((suggestion) => ({
    originalText: suggestion.originalText,
    suggestedText: suggestion.suggestedText,
  }));
  const fallbackMarkdown = applyReplacementsSafely(
    currentMarkdown,
    replacements,
  );
  const nextEditorJson = buildReplacementEditorJson({
    currentEditorJson: document.editor_json,
    fallbackMarkdown,
    replacements,
  });
  const nextMarkdown = serializeEditorJsonOrFallback(
    nextEditorJson,
    fallbackMarkdown,
  );

  const updated = await updateDocumentContent(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    currentMarkdown: nextMarkdown,
    editorJson: nextEditorJson,
  });

  if (!updated) {
    return null;
  }

  const { error } = await supabase
    .from("suggestions")
    .update({
      status: "applied",
      updated_at: new Date().toISOString(),
    })
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .in(
      "id",
      pending.map((suggestion) => suggestion.id),
    );

  if (error) {
    console.error("[suggestions/apply-all/status]", error.message);
    throw new Error("Failed to mark suggestions as applied");
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "suggestion_apply",
    documentId: input.documentId,
    metadata: {
      versionNumber: snapshot.versionNumber,
      appliedCount: pending.length,
      batch: true,
    },
  });

  return {
    documentId: input.documentId,
    appliedCount: pending.length,
    versionNumber: snapshot.versionNumber,
    currentMarkdown: nextMarkdown,
    editorJson: updated.editorJson,
    wordCount: updated.wordCount,
  };
}

export async function applySelectedSuggestions(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    selectionId: string;
    editedMarkdown?: string;
  },
): Promise<ApplyAllSuggestionsResult | null> {
  const selection = await getOwnedActiveSelection(supabase, input);

  if (!selection) {
    return null;
  }

  const suggestions = await getOwnedPendingSuggestionsByIds(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    suggestionIds: selection.suggestion_ids,
  });

  if (!suggestions) {
    return null;
  }

  if (suggestions.length === 0) {
    throw new SuggestionReplacementError(
      "There are no pending suggestions to apply.",
    );
  }

  const document = await getOwnedDocumentContent(
    supabase,
    input.userId,
    input.documentId,
  );

  if (!document) {
    return null;
  }

  const currentMarkdown = document.current_markdown ?? "";
  const editedMarkdown = input.editedMarkdown?.trim();
  const editedBeforeApply = Boolean(editedMarkdown);

  if (!editedBeforeApply) {
    for (const suggestion of suggestions) {
      const safety = getReplacementSafety(
        currentMarkdown,
        suggestion.originalText,
      );

      if (safety !== "safe") {
        throw new SuggestionReplacementError(
          safety === "missing"
            ? "One or more suggestions no longer match the document. Review suggestions again."
            : "One or more suggestions match multiple places in the document. Apply suggestions individually.",
        );
      }
    }
  }

  const snapshot = await snapshotDocumentVersion(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    source: "suggestion_apply",
    notes: editedBeforeApply
      ? "Selected AI suggestions edited before apply"
      : `Before applying ${suggestions.length} selected suggestions`,
  });

  if (!snapshot) {
    return null;
  }

  const replacements = toReplacementPairs(suggestions);
  const fallbackMarkdown =
    editedMarkdown ??
    applyReplacementsSafely(currentMarkdown, replacements);
  const nextEditorJson = editedMarkdown
    ? markdownToEditorJson(fallbackMarkdown)
    : buildReplacementEditorJson({
        currentEditorJson: document.editor_json,
        fallbackMarkdown,
        replacements,
      });
  const nextMarkdown = serializeEditorJsonOrFallback(
    nextEditorJson,
    fallbackMarkdown,
  );

  const updated = await updateDocumentContent(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    currentMarkdown: nextMarkdown,
    editorJson: nextEditorJson,
  });

  if (!updated) {
    return null;
  }

  const suggestionIds = suggestions.map((suggestion) => suggestion.id);
  const { error: statusError } = await supabase
    .from("suggestions")
    .update({
      status: "applied",
      updated_at: new Date().toISOString(),
    })
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("status", "pending")
    .in("id", suggestionIds);

  if (statusError) {
    console.error("[suggestions/apply-selected/status]", statusError.message);
    throw new Error("Failed to mark selected suggestions as applied");
  }

  const { error: selectionError } = await supabase
    .from("suggestion_preview_selections")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", input.selectionId)
    .eq("user_id", input.userId)
    .eq("document_id", input.documentId);

  if (selectionError) {
    console.error("[suggestions/apply-selected/consume]", selectionError.message);
    throw new Error("Failed to consume suggestion selection");
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "suggestion_apply",
    documentId: input.documentId,
    metadata: {
      versionNumber: snapshot.versionNumber,
      appliedCount: suggestions.length,
      batch: true,
      selectionId: input.selectionId,
      suggestionIds,
      editedBeforeApply,
    },
  });

  return {
    documentId: input.documentId,
    appliedCount: suggestions.length,
    versionNumber: snapshot.versionNumber,
    currentMarkdown: nextMarkdown,
    editorJson: updated.editorJson,
    wordCount: updated.wordCount,
  };
}

export { SuggestionReplacementError };
