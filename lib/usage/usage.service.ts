import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/lib/supabase/types";

export type UsageEventType =
  | "upload"
  | "document_create"
  | "ai_action"
  | "suggestion_apply"
  | "export"
  | "version_restore"
  | "manual_save";

type RecordUsageInput = {
  userId: string;
  eventType: UsageEventType;
  documentId?: string;
  metadata?: Record<string, unknown>;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
};

export async function recordUsageEvent(
  supabase: SupabaseClient<Database>,
  input: RecordUsageInput,
): Promise<void> {
  const payload: TablesInsert<"usage_ledger"> = {
    user_id: input.userId,
    event_type: input.eventType,
    document_id: input.documentId ?? null,
    provider: input.provider ?? null,
    model: input.model ?? null,
    input_tokens: input.inputTokens ?? null,
    output_tokens: input.outputTokens ?? null,
    estimated_cost: input.estimatedCost ?? null,
    metadata: (input.metadata ?? {}) as TablesInsert<"usage_ledger">["metadata"],
  };

  const { error } = await supabase.from("usage_ledger").insert(payload);

  if (error) {
    // Usage tracking is non-critical: log and continue without failing the action.
    console.error("[usage/record]", error.message);
  }
}
