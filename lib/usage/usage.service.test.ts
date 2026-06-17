import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Database } from "@/lib/supabase/types";
import { recordUsageEvent } from "@/lib/usage/usage.service";

function createSupabaseMock(error: { message: string } | null = null) {
  const insert = vi.fn(async () => ({ error }));
  const from = vi.fn((table: string) => {
    expect(table).toBe("usage_ledger");
    return { insert };
  });

  return {
    supabase: { from } as unknown as SupabaseClient<Database>,
    insert,
  };
}

describe("recordUsageEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records usage ledger rows with user ownership and metadata", async () => {
    const { supabase, insert } = createSupabaseMock();

    await recordUsageEvent(supabase, {
      userId: "user-id",
      documentId: "document-id",
      eventType: "ai_action",
      provider: "gemini",
      model: "gemini-test",
      inputTokens: 120,
      outputTokens: 80,
      estimatedCost: 0.001,
      metadata: { action: "optimize" },
    });

    expect(insert).toHaveBeenCalledWith({
      user_id: "user-id",
      event_type: "ai_action",
      document_id: "document-id",
      provider: "gemini",
      model: "gemini-test",
      input_tokens: 120,
      output_tokens: 80,
      estimated_cost: 0.001,
      metadata: { action: "optimize" },
    });
  });

  it("does not fail the primary action when usage logging fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { supabase } = createSupabaseMock({ message: "insert failed" });

    await expect(
      recordUsageEvent(supabase, {
        userId: "user-id",
        eventType: "manual_save",
      }),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith("[usage/record]", "insert failed");
  });
});
