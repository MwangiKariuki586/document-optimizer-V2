import type { SupabaseClient } from "@supabase/supabase-js";

import { runAIAction } from "@/lib/ai/ai-router";
import type {
  AIActionOutput,
  AIActionInput,
  AIActionKey,
  AIActionOptions,
  AIActionResult,
  AIProviderName,
} from "@/lib/ai/ai.types";
import { aiActionSchema, parseAIActionOutput } from "@/lib/ai/ai.validators";
import { countWords, plainTextToEditorJson } from "@/lib/documents/text-to-editor";
import { recordUsageEvent } from "@/lib/usage/usage.service";
import type { Database, TablesInsert, TablesUpdate } from "@/lib/supabase/types";
import { snapshotDocumentVersion } from "@/lib/versions/versions.service";

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
    }
  | {
      status: "failed";
      id: string;
      error: string;
    };

export type AIRequestPreview = {
  id: string;
  documentId: string;
  documentTitle: string;
  action: AIActionKey;
  status: string;
  originalMarkdown: string;
  output: AIActionOutput;
  provider: string | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  completedAt: string | null;
};

export type ApplyAIRequestResult = {
  documentId: string;
  versionNumber: number;
};

type OwnedDocument = {
  id: string;
  title: string;
  word_count: number;
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

async function getOwnedDocument(
  supabase: SupabaseClient<Database>,
  userId: string,
  documentId: string,
): Promise<OwnedDocument | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,word_count")
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
    .eq("id", requestId);

  if (error) {
    console.error("[ai/request/complete]", error.message);
    throw new Error("Failed to save AI result");
  }
}

async function markAIRequestFailed(
  supabase: SupabaseClient<Database>,
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
    .eq("id", requestId);

  if (error) {
    console.error("[ai/request/fail]", error.message);
  }
}

export async function runDocumentAIAction(
  supabase: SupabaseClient<Database>,
  input: RunDocumentAIActionInput,
): Promise<RunDocumentAIActionResult | null> {
  const document = await getOwnedDocument(
    supabase,
    input.userId,
    input.documentId,
  );

  if (!document) {
    return null;
  }

  const requestId = await createAIRequest(supabase, input, document);
  const aiInput: AIActionInput = {
    action: input.action,
    title: document.title,
    contentMarkdown: input.contentMarkdown,
    options: input.options,
    provider: input.provider,
    model: input.model,
  };

  try {
    const result = await runAIAction(aiInput);
    await markAIRequestCompleted(supabase, requestId, result);
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

    return { status: "completed", id: requestId, result };
  } catch (error) {
    console.error("[ai/run-document-action]", error);
    const safeError = "Could not run AI action. Please try again.";
    await markAIRequestFailed(supabase, requestId, safeError);

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
      "id,document_id,action,status,output,provider,model,input_tokens,output_tokens,estimated_cost,completed_at,documents!inner(id,title,current_markdown,user_id)",
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
  },
): Promise<ApplyAIRequestResult | null> {
  const preview = await getAIRequestPreview(supabase, input);

  if (!preview) {
    return null;
  }

  const revisedMarkdown = preview.output.revisedMarkdown?.trim();

  if (!revisedMarkdown) {
    throw new Error("AI result has no document changes to apply");
  }

  const snapshot = await snapshotDocumentVersion(supabase, {
    userId: input.userId,
    documentId: input.documentId,
    source: "ai_apply",
    notes: `Before applying AI request ${input.requestId}`,
  });

  if (!snapshot) {
    return null;
  }

  const { data, error } = await supabase
    .from("documents")
    .update({
      current_markdown: revisedMarkdown,
      editor_json: plainTextToEditorJson(revisedMarkdown),
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
      versionNumber: snapshot.versionNumber,
    },
  });

  return {
    documentId: data.id,
    versionNumber: snapshot.versionNumber,
  };
}
