import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { createClient } from "@supabase/supabase-js";

import { runAIAction } from "../lib/ai/ai-router";
import type { AIActionKey, AIActionOptions } from "../lib/ai/ai.types";
import { saveSuggestionsFromAIResult } from "../lib/suggestions/suggestions.service";
import type { Database, TablesInsert, TablesUpdate } from "../lib/supabase/types";
import { recordUsageEvent } from "../lib/usage/usage.service";

type DocumentRow = {
  id: string;
  user_id: string;
  title: string;
  current_markdown: string | null;
  word_count: number;
};

type TimingRow = {
  step: string;
  ms: number;
};

const action = (process.env.AI_ACTION as AIActionKey | undefined) ?? "improvement_scan";

const options: AIActionOptions = {
  tone: "professional",
  audience: "general",
  language: "en",
  preserveStructure: true,
};

if (action === "tone_alignment") {
  options.toneTarget = "professional";
  options.audienceOrPurpose = "hiring manager reviewing a technical resume";
}

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const envFile = readFileSync(envPath, "utf8");

  for (const line of envFile.split(/\r?\n/u)) {
    if (!line || /^\s*#/u.test(line) || !line.includes("=")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    const name = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim().replace(/^["']|["']$/gu, "");

    if (name && process.env[name] === undefined) {
      process.env[name] = value;
    }
  }
}

async function timeStep<T>(
  timings: TimingRow[],
  step: string,
  run: () => Promise<T>,
): Promise<T> {
  const started = performance.now();
  const result = await run();
  timings.push({ step, ms: Math.round(performance.now() - started) });
  return result;
}

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase server environment variables are not configured");
  }

  return createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });
}

async function loadDocument(
  supabase: ReturnType<typeof createSupabaseClient>,
): Promise<DocumentRow> {
  const documentId = process.env.DOCUMENT_ID;

  if (documentId) {
    const { data, error } = await supabase
      .from("documents")
      .select("id,user_id,title,current_markdown,word_count")
      .eq("id", documentId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load document: ${error.message}`);
    }

    if (!data?.current_markdown) {
      throw new Error("The selected document has no markdown content");
    }

    return data as DocumentRow;
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id,user_id,title,current_markdown,word_count")
    .not("current_markdown", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load document: ${error.message}`);
  }

  if (!data?.current_markdown) {
    throw new Error("No document with markdown content was found");
  }

  return data as DocumentRow;
}

async function createAIRequest(
  supabase: ReturnType<typeof createSupabaseClient>,
  document: DocumentRow,
): Promise<string> {
  const payload: TablesInsert<"ai_requests"> = {
    user_id: document.user_id,
    document_id: document.id,
    action,
    status: "running",
    input_summary: `latency test: ${action} on ${document.word_count} words`,
    provider: "deepseek",
    model: null,
  };

  const { data, error } = await supabase
    .from("ai_requests")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create AI request: ${error?.message ?? "no row"}`);
  }

  return data.id;
}

async function markCompleted(
  supabase: ReturnType<typeof createSupabaseClient>,
  input: {
    userId: string;
    requestId: string;
    result: Awaited<ReturnType<typeof runAIAction>>;
  },
) {
  const payload: TablesUpdate<"ai_requests"> = {
    status: "completed",
    output: input.result.output as TablesUpdate<"ai_requests">["output"],
    provider: input.result.provider,
    model: input.result.model,
    input_tokens: input.result.inputTokens ?? null,
    output_tokens: input.result.outputTokens ?? null,
    estimated_cost: input.result.estimatedCost ?? null,
    error_message: null,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("ai_requests")
    .update(payload)
    .eq("id", input.requestId)
    .eq("user_id", input.userId);

  if (error) {
    throw new Error(`Failed to mark request completed: ${error.message}`);
  }
}

async function main() {
  loadEnvLocal();

  const timings: TimingRow[] = [];
  const totalStarted = performance.now();
  const supabase = createSupabaseClient();

  const document = await timeStep(timings, "load document", () =>
    loadDocument(supabase),
  );

  const requestId = await timeStep(timings, "create ai_requests row", () =>
    createAIRequest(supabase, document),
  );

  const result = await timeStep(timings, "provider call + normalization", () =>
    runAIAction({
      action,
      title: document.title,
      contentMarkdown: document.current_markdown ?? "",
      options,
      provider: "deepseek",
    }),
  );

  await timeStep(timings, "save ai_requests output", () =>
    markCompleted(supabase, {
      userId: document.user_id,
      requestId,
      result,
    }),
  );

  const suggestions = await timeStep(timings, "anchor + insert suggestions", () =>
    saveSuggestionsFromAIResult(supabase, {
      userId: document.user_id,
      documentId: document.id,
      aiRequestId: requestId,
      action,
      originalMarkdown: document.current_markdown ?? "",
      output: result.output,
    }),
  );

  await timeStep(timings, "insert usage ledger row", () =>
    recordUsageEvent(supabase, {
      userId: document.user_id,
      eventType: "ai_action",
      documentId: document.id,
      provider: result.provider,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCost: result.estimatedCost,
      metadata: {
        aiRequestId: requestId,
        action: result.action,
        mode: result.mode,
        source: "latency_script",
      },
    }),
  );

  const totalMs = Math.round(performance.now() - totalStarted);

  console.log(
    JSON.stringify(
      {
        action,
        requestId,
        documentId: document.id,
        documentWords: document.word_count,
        provider: result.provider,
        model: result.model,
        mode: result.mode,
        workflow: result.output.workflow,
        generatedSuggestions: result.output.suggestions.length,
        savedSuggestions: suggestions.length,
        inputTokens: result.inputTokens ?? null,
        outputTokens: result.outputTokens ?? null,
        totalMs,
        timings,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[test-ai-action-latency]", error);
  process.exit(1);
});
