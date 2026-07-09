import { describe, expect, it, vi } from "vitest";

import {
  buildRateLimitRules,
  enforceRateLimit,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";

function createSupabaseMock(
  rows: Array<{ allowed: boolean; remaining: number; reset_at: string; limit_count: number }>,
) {
  const queue = [...rows];
  const rpc = vi.fn(async () => {
    const row = queue.shift();

    if (!row) {
      return { data: null, error: { message: "Unexpected RPC call" } };
    }

    return { data: [row], error: null };
  });

  return { rpc };
}

describe("rate limit service", () => {
  it("builds balanced AI action rules with user and document scopes", () => {
    expect(
      buildRateLimitRules("aiAction", {
        userId: "user-id",
        documentId: "document-id",
      }),
    ).toEqual([
      expect.objectContaining({
        ruleKey: "ai_action:user:minute",
        subjectKey: "user:user-id",
        maxCount: 5,
      }),
      expect.objectContaining({
        ruleKey: "ai_action:document:minute",
        subjectKey: "user:user-id:document:document-id",
        maxCount: 3,
      }),
      expect.objectContaining({
        ruleKey: "ai_action:user:day",
        subjectKey: "user:user-id",
        maxCount: 50,
      }),
    ]);
  });

  it("returns results for allowed requests", async () => {
    const supabase = createSupabaseMock([
      {
        allowed: true,
        remaining: 4,
        reset_at: "2026-07-09T09:25:00.000Z",
        limit_count: 5,
      },
    ]);

    await expect(
      enforceRateLimit(supabase as never, [
        {
          ruleKey: "ai_action:user:minute",
          subjectKey: "user:user-id",
          maxCount: 5,
          windowSeconds: 60,
        },
      ]),
    ).resolves.toEqual([
      {
        allowed: true,
        remaining: 4,
        resetAt: "2026-07-09T09:25:00.000Z",
        limit: 5,
        windowSeconds: 60,
      },
    ]);
  });

  it("throws RateLimitExceededError when a rule is exceeded", async () => {
    const resetAt = new Date(Date.now() + 30_000).toISOString();
    const supabase = createSupabaseMock([
      {
        allowed: false,
        remaining: 0,
        reset_at: resetAt,
        limit_count: 5,
      },
    ]);

    await expect(
      enforceRateLimit(supabase as never, [
        {
          ruleKey: "ai_action:user:minute",
          subjectKey: "user:user-id",
          maxCount: 5,
          windowSeconds: 60,
        },
      ]),
    ).rejects.toMatchObject({
      name: "RateLimitExceededError",
      message: expect.stringMatching(
        /^Limit reached: 5 requests per minute\. Try again in \d+ seconds\.$/,
      ),
      remaining: 0,
      resetAt,
      limit: 5,
      windowSeconds: 60,
    });
  });

  it("fails closed when any rule in a multi-rule check is exceeded", async () => {
    const supabase = createSupabaseMock([
      {
        allowed: true,
        remaining: 4,
        reset_at: "2026-07-09T09:25:00.000Z",
        limit_count: 5,
      },
      {
        allowed: false,
        remaining: 0,
        reset_at: "2026-07-09T09:25:00.000Z",
        limit_count: 3,
      },
    ]);

    await expect(
      enforceRateLimit(supabase as never, [
        {
          ruleKey: "ai_action:user:minute",
          subjectKey: "user:user-id",
          maxCount: 5,
          windowSeconds: 60,
        },
        {
          ruleKey: "ai_action:document:minute",
          subjectKey: "user:user-id:document:document-id",
          maxCount: 3,
          windowSeconds: 60,
        },
      ]),
    ).rejects.toBeInstanceOf(RateLimitExceededError);
  });

  it("fails closed when the RPC errors", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "database unavailable" },
    }));

    await expect(
      enforceRateLimit({ rpc } as never, [
        {
          ruleKey: "ai_action:user:minute",
          subjectKey: "user:user-id",
          maxCount: 5,
          windowSeconds: 60,
        },
      ]),
    ).rejects.toThrow("Could not verify request limits");
  });
});
