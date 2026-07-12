import type { SupabaseClient } from "@supabase/supabase-js";

import { runAIAction } from "@/lib/ai/ai-router";
import type {
  AIActionOutput,
  AIActionInput,
  AIActionKey,
  AIActionOptions,
  AIActionRun,
  AIRequestPreview,
  AIActionResult,
  AIProviderName,
} from "@/lib/ai/ai.types";
import { aiActionSchema, parseAIActionOutput } from "@/lib/ai/ai.validators";
import { markdownToEditorJson } from "@/lib/documents/markdown-to-editor";
import { countWords } from "@/lib/documents/text-to-editor";
import { devLog } from "@/lib/logging/dev-log";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import type { Database, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { saveSuggestionsFromAIResult } from "@/lib/suggestions/suggestions.service";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import {
  createDocumentVersion,
  snapshotDocumentVersion,
} from "@/lib/versions/versions.service";

type RunDocumentAIActionInput = {
  userId: string;
  documentId: string;
  action: AIActionKey;
  contentMarkdown: string;
  options: AIActionOptions;
  provider?: AIProviderName;
  model?: string;
};

export type RunDocumentAIActionResult =
  | {
      status: "completed";
      id: string;
      result: AIActionResult;
      suggestions: DocumentSuggestion[];
    }
  | { status: "failed"; id: string; error: string };

export type ApplyAIRequestResult = {
  documentId: string;
  versionNumber: number;
};

export type SaveAIRequestVersionResult = {
  documentId: string;
  versionNumber: number;
};

export type SaveAIRequestCopyResult = {
  documentId: string;
  title: string;
};

type OwnedDocument = {
  id: string;
  title: string;
  word_count: number;
  current_markdown: string | null;
};

function toAIActionKey(action: string): AIActionKey {
  const parsed = aiActionSchema.safeParse(action);

  if (!parsed.success) {
    throw new Error("Invalid stored AI action");
  }

  return parsed.data;
}

function parseStoredAIOutput(output: unknown): AIActionOutput | null {
  const parsed = parseAIActionOutput(output);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function listDocumentAIActionRuns(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<AIActionRun[]> {
  const { data, error } = await supabase
    .from("ai_requests")
    .select("id,action,status,output,created_at,completed_at")
    .eq("document_id", documentId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ai/request/list]", error.message);
    throw new Error("Failed to load AI action history");
  }

  return (data ?? []).map((row) => {
    const output = parseStoredAIOutput(row.output);

    return {
      id: row.id,
      action: toAIActionKey(row.action),
      status: row.status,
      summary: output?.summary ?? null,
      suggestionCount: output?.suggestions.length ?? 0,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  });
}

async function getOwnedDocument(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<OwnedDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,word_count,current_markdown")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[ai/document]", error.message);
    throw new Error("Failed to load document for AI action");
  }

  return data;
}

async function createAIRequest(
  supabase: SupabaseClient<Database>,
  input: RunDocumentAIActionInput,
  document: OwnedDocument,
): Promise<string> {
  const payload: TablesInsert<"ai_requests"> = {
    user_id: input.userId,
    document_id: input.documentId,
    action: input.action,
    status: "running",
    input_summary: `${input.action} on ${document.word_count} words`,
    provider: input.provider ?? null,
    model: input.model ?? null,
  };

  const { data, error } = await supabase
    .from("ai_requests")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[ai/request/create]", error?.message);
    throw new Error("Failed to create AI request");
  }

  return data.id;
}

async function markAIRequestCompleted(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestId: string,
  result: AIActionResult,
): Promise<void> {
  const payload: TablesUpdate<"ai_requests"> = {
    status: "completed",
    output: result.output as TablesUpdate<"ai_requests">["output"],
    provider: result.provider,
    model: result.model,
    input_tokens: result.inputTokens ?? null,
    output_tokens: result.outputTokens ?? null,
    estimated_cost: result.estimatedCost ?? null,
    error_message: null,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("ai_requests")
    .update(payload)
    .eq("id", requestId)
    .eq("user_id", userId);

  if (error) {
    console.error("[ai/request/complete]", error.message);
    throw new Error("Failed to save AI result");
  }
}

async function markAIRequestFailed(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestId: string,
  errorMessage: string,
): Promise<void> {
  const payload: TablesUpdate<"ai_requests"> = {
    status: "failed",
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("ai_requests")
    .update(payload)
    .eq("id", requestId)
    .eq("user_id", userId);

  if (error) {
    console.error("[ai/request/fail]", error.message);
  }
}

export async function runDocumentAIAction(
  supabase: SupabaseClient<Database>,
  input: RunDocumentAIActionInput,
): Promise<RunDocumentAIActionResult | null> {
  const actionStartedAt = performance.now();
  const document = await getOwnedDocument(
    supabase,
    input.userId,
    input.documentId,
  );

  if (!document) {
    return null;
  }

  const requestId = await createAIRequest(supabase, input, document);
  devLog("ai/run-document-action", "request created", {
    documentId: input.documentId,
    requestId,
    action: input.action,
  });

  const aiInput: AIActionInput = {
    action: input.action,
    title: document.title,
    contentMarkdown: input.contentMarkdown,
    options: input.options,
    provider: input.provider,
    model: input.model,
  };

  try {
    const providerStartedAt = performance.now();
    const result = await runAIAction(aiInput);
    const providerDurationMs = Math.round(performance.now() - providerStartedAt);
    devLog("ai/run-document-action", "provider response", {
      documentId: input.documentId,
      requestId,
      action: input.action,
      mode: result.mode,
      suggestionCount: result.output.suggestions.length,
      hasRevisedMarkdown: Boolean(result.output.revisedMarkdown),
      provider: result.provider,
      model: result.model,
      providerDurationMs,
    });

    const persistenceStartedAt = performance.now();
    await markAIRequestCompleted(supabase, input.userId, requestId, result);
    let savedSuggestions: DocumentSuggestion[] = [];

    try {
      savedSuggestions = await saveSuggestionsFromAIResult(supabase, {
        userId: input.userId,
        documentId: input.documentId,
        aiRequestId: requestId,
        action: input.action,
        originalMarkdown: input.contentMarkdown,
        fallbackMarkdown: document.current_markdown ?? undefined,
        output: result.output,
      });
    } catch (error) {
      console.error("[ai/run-document-action] suggestion persistence failed", {
        documentId: input.documentId,
        requestId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    devLog("ai/run-document-action", "suggestions saved", {
      documentId: input.documentId,
      requestId,
      savedSuggestionCount: savedSuggestions.length,
    });

    await recordUsageEvent(supabase, {
      userId: input.userId,
      eventType: "ai_action",
      documentId: input.documentId,
      provider: result.provider,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      metadata: {
        aiRequestId: requestId,
        action: result.action,
        mode: result.mode,
      },
    });

    devLog("ai/run-document-action", "completed", {
      documentId: input.documentId,
      requestId,
      providerDurationMs,
      persistenceDurationMs: Math.round(
        performance.now() - persistenceStartedAt,
      ),
      totalDurationMs: Math.round(performance.now() - actionStartedAt),
    });

    return {
      status: "completed",
      id: requestId,
      result,
      suggestions: savedSuggestions,
    };
  } catch (error) {
    console.error("[ai/run-document-action]", error);
    const safeError = "Could not run AI action. Please try again.";
    await markAIRequestFailed(supabase, input.userId, requestId, safeError);

    return { status: "failed", id: requestId, error: safeError };
  }
}

export async function getAIRequestPreview(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    requestId: string;
  },
): Promise<AIRequestPreview | null> {
  const { data, error } = await supabase
    .from("ai_requests")
    .select(
      "id,document_id,action,status,output,provider,model,input_tokens,output_tokens,estimated_cost,completed_at,documents!inner(id,title,current_markdown,editor_json,user_id)",
    )
    .eq("id", input.requestId)
    .eq("document_id", input.documentId)
    .eq("user_id", input.userId)
    .eq("documents.user_id", input.userId)
    .maybeSingle();

  if (error) {
    console.error("[ai/preview]", error.message);
    throw new Error("Failed to load AI result");
  }

  if (!data || data.status !== "completed") {
    return null;
  }

  const output = parseStoredAIOutput(data.output);

  if (!output) {
    return null;
  }

  const document = Array.isArray(data.documents)
    ? data.documents[0]
    : data.documents;

  if (!document) {
    return null;
  }

  return {
    id: data.id,
    documentId: data.document_id,
    documentTitle: document.title,
    action: toAIActionKey(data.action),
    status: data.status,
    originalMarkdown: document.current_markdown ?? "",
    originalEditorJson: document.editor_json,
    output,
    provider: data.provider,
    model: data.model,
    inputTokens: data.input_tokens,
    outputTokens: data.output_tokens,
    estimatedCost: data.estimated_cost,
    completedAt: data.completed_at,
  };
}

export async function applyAIRequestResult(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    requestId: string;
    editedMarkdown?: string;
  },
): Promise<ApplyAIRequestResult | null> {
  const preview = await getAIRequestPreview(supabase, input);

  if (!preview) {
    return null;
  }

  const editedMarkdown = input.editedMarkdown?.trim();
  const revisedMarkdown =
    editedMarkdown || preview.output.revisedMarkdown?.trim();

  if (!revisedMarkdown) {
    throw new Error("AI result has no document changes to apply");
  }

  const editedBeforeApply = Boolean(editedMarkdown);

  const snapshot = await snapshotDocumentVersion(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    source: "ai_apply",
    notes: editedBeforeApply
      ? "AI result edited before apply"
      : `Before applying AI request ${input.requestId}`,
  });

  if (!snapshot) {
    return null;
  }

  const { data, error } = await supabase
    .from("documents")
    .update({
      current_markdown: revisedMarkdown,
      editor_json: markdownToEditorJson(revisedMarkdown),
      word_count: countWords(revisedMarkdown),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.documentId)
    .eq("user_id", input.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[ai/apply]", error.message);
    throw new Error("Failed to apply AI result");
  }

  if (!data) {
    return null;
  }

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "ai_action",
    documentId: input.documentId,
    provider: preview.provider ?? undefined,
    model: preview.model ?? undefined,
    metadata: {
      aiRequestId: input.requestId,
      action: preview.action,
      applied: true,
      editedBeforeApply,
      versionNumber: snapshot.versionNumber,
    },
  });

  return {
    documentId: data.id,
    versionNumber: snapshot.versionNumber,
  };
}

function getAIResultMarkdown(preview: AIRequestPreview): string {
  const revisedMarkdown = preview.output.revisedMarkdown?.trim();

  if (!revisedMarkdown) {
    throw new Error("AI result has no document content to save");
  }

  return revisedMarkdown;
}

const TRANSLATION_TITLE_LABELS: Record<string, string> = {
  en: "English",
  sw: "Swahili",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  nl: "Dutch",
  ar: "Arabic",
  hi: "Hindi",
  "zh-CN": "Chinese Simplified",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  ru: "Russian",
  pl: "Polish",
  uk: "Ukrainian",
  id: "Indonesian",
  ms: "Malay",
  vi: "Vietnamese",
  th: "Thai",
  fil: "Filipino / Tagalog",
};

function buildAIResultCopyTitle(preview: AIRequestPreview): string {
  if (preview.output.resultMode === "translation") {
    const output = preview.output as AIActionOutput & {
      targetLanguage?: string;
    };
    const language =
      (output.targetLanguage && TRANSLATION_TITLE_LABELS[output.targetLanguage]) ||
      "Translated";

    return `${preview.documentTitle} - ${language} Translation`;
  }

  if (preview.output.resultMode === "summary") {
    return `${preview.documentTitle} - Summary`;
  }

  return `${preview.documentTitle} - AI Result`;
}

export async function saveAIRequestResultAsVersion(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    requestId: string;
  },
): Promise<SaveAIRequestVersionResult | null> {
  const preview = await getAIRequestPreview(supabase, input);

  if (!preview) {
    return null;
  }

  const revisedMarkdown = getAIResultMarkdown(preview);
  const version = await createDocumentVersion(supabase, {
    documentId: input.documentId,
    userId: input.userId,
    title: preview.documentTitle,
    source: "ai_apply",
    contentMarkdown: revisedMarkdown,
    editorJson: markdownToEditorJson(revisedMarkdown),
    formattingMetadata: {
      aiRequestId: input.requestId,
      resultMode: preview.output.resultMode ?? null,
      savedWithoutReplacingOriginal: true,
    },
    notes: `Saved AI ${preview.output.resultMode ?? "result"} as a version`,
  });

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "ai_action",
    documentId: input.documentId,
    provider: preview.provider ?? undefined,
    model: preview.model ?? undefined,
    metadata: {
      aiRequestId: input.requestId,
      action: preview.action,
      savedAsVersion: true,
      versionNumber: version.versionNumber,
    },
  });

  return {
    documentId: input.documentId,
    versionNumber: version.versionNumber,
  };
}

export async function saveAIRequestResultAsDocumentCopy(
  supabase: SupabaseClient<Database>,
  input: {
    userId: string;
    documentId: string;
    requestId: string;
  },
): Promise<SaveAIRequestCopyResult | null> {
  const preview = await getAIRequestPreview(supabase, input);

  if (!preview) {
    return null;
  }

  const revisedMarkdown = getAIResultMarkdown(preview);
  const title = buildAIResultCopyTitle(preview);
  const editorJson = markdownToEditorJson(revisedMarkdown);
  const wordCount = countWords(revisedMarkdown);

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      user_id: input.userId,
      title,
      status: "ready",
      source_type: "paste",
      file_type: "none",
      extracted_text: revisedMarkdown,
      editor_json: editorJson,
      current_markdown: revisedMarkdown,
      formatting_metadata: {
        aiRequestId: input.requestId,
        sourceDocumentId: input.documentId,
        resultMode: preview.output.resultMode ?? null,
      },
      fidelity_status: "Structure Preserved",
      word_count: wordCount,
    })
    .select("id,title")
    .single();

  if (error || !document) {
    console.error("[ai/save-copy]", error?.message);
    throw new Error("Failed to save AI result as a new document");
  }

  await createDocumentVersion(supabase, {
    documentId: document.id,
    userId: input.userId,
    title: document.title,
    source: "ai_apply",
    contentMarkdown: revisedMarkdown,
    editorJson,
    formattingMetadata: {
      aiRequestId: input.requestId,
      sourceDocumentId: input.documentId,
      resultMode: preview.output.resultMode ?? null,
    },
    notes: "AI result saved as a separate document",
  });

  await recordUsageEvent(supabase, {
    userId: input.userId,
    eventType: "ai_action",
    documentId: document.id,
    provider: preview.provider ?? undefined,
    model: preview.model ?? undefined,
    metadata: {
      aiRequestId: input.requestId,
      sourceDocumentId: input.documentId,
      action: preview.action,
      savedAsDocumentCopy: true,
      resultMode: preview.output.resultMode ?? null,
    },
  });

  return {
    documentId: document.id,
    title: document.title,
  };
}
