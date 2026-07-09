import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export type RateLimitRule = {
  ruleKey: string;
  subjectKey: string;
  maxCount: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitRpcRow = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
  limit_count: number;
};

type RateLimitPreset =
  | "aiAction"
  | "uploadInit"
  | "pasteDocumentCreate"
  | "exportGenerate"
  | "exportDownload"
  | "suggestionMutation"
  | "versionMutation";

type BuildRateLimitRulesInput = {
  userId: string;
  documentId?: string;
};

export class RateLimitExceededError extends Error {
  retryAfterSeconds: number;
  resetAt: string;
  limit: number;
  remaining: number;
  windowSeconds: number;

  constructor(result: RateLimitResult) {
    const retryAfter = retryAfterSeconds(result.resetAt);

    super(
      `Limit reached: ${result.limit} request${result.limit === 1 ? "" : "s"} per ${windowLabel(result.windowSeconds)}. Try again ${retryAfterLabel(retryAfter)}.`,
    );
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = retryAfter;
    this.resetAt = result.resetAt;
    this.limit = result.limit;
    this.remaining = result.remaining;
    this.windowSeconds = result.windowSeconds;
  }
}

function retryAfterSeconds(resetAt: string): number {
  const resetTime = new Date(resetAt).getTime();

  if (Number.isNaN(resetTime)) {
    return 60;
  }

  return Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
}

function retryAfterLabel(seconds: number): string {
  if (seconds < 60) {
    return `in ${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.ceil(seconds / 60);

  if (minutes < 60) {
    return `in about ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.ceil(minutes / 60);

  if (hours < 24) {
    return `in about ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = Math.ceil(hours / 24);

  return `in about ${days} day${days === 1 ? "" : "s"}`;
}

function windowLabel(seconds: number): string {
  if (seconds === 60) return "minute";
  if (seconds === 3_600) return "hour";
  if (seconds === 86_400) return "day";

  return `${seconds} seconds`;
}

function userSubject(userId: string): string {
  return `user:${userId}`;
}

function documentSubject(userId: string, documentId: string): string {
  return `user:${userId}:document:${documentId}`;
}

function requireDocumentId(preset: RateLimitPreset, documentId?: string): string {
  if (!documentId) {
    throw new Error(`Rate limit preset ${preset} requires a document id`);
  }

  return documentId;
}

export function buildRateLimitRules(
  preset: RateLimitPreset,
  input: BuildRateLimitRulesInput,
): RateLimitRule[] {
  const user = userSubject(input.userId);

  switch (preset) {
    case "aiAction": {
      const documentId = requireDocumentId(preset, input.documentId);

      return [
        {
          ruleKey: "ai_action:user:minute",
          subjectKey: user,
          maxCount: 5,
          windowSeconds: 60,
        },
        {
          ruleKey: "ai_action:document:minute",
          subjectKey: documentSubject(input.userId, documentId),
          maxCount: 3,
          windowSeconds: 60,
        },
        {
          ruleKey: "ai_action:user:day",
          subjectKey: user,
          maxCount: 50,
          windowSeconds: 86_400,
        },
      ];
    }
    case "uploadInit":
      return [
        {
          ruleKey: "upload_init:user:hour",
          subjectKey: user,
          maxCount: 10,
          windowSeconds: 3_600,
        },
      ];
    case "pasteDocumentCreate":
      return [
        {
          ruleKey: "paste_document_create:user:hour",
          subjectKey: user,
          maxCount: 20,
          windowSeconds: 3_600,
        },
      ];
    case "exportGenerate": {
      const documentId = requireDocumentId(preset, input.documentId);

      return [
        {
          ruleKey: "export_generate:document:minute",
          subjectKey: documentSubject(input.userId, documentId),
          maxCount: 3,
          windowSeconds: 60,
        },
        {
          ruleKey: "export_generate:user:hour",
          subjectKey: user,
          maxCount: 10,
          windowSeconds: 3_600,
        },
      ];
    }
    case "exportDownload":
      return [
        {
          ruleKey: "export_download:user:hour",
          subjectKey: user,
          maxCount: 30,
          windowSeconds: 3_600,
        },
      ];
    case "suggestionMutation": {
      const documentId = requireDocumentId(preset, input.documentId);

      return [
        {
          ruleKey: "suggestion_mutation:document:minute",
          subjectKey: documentSubject(input.userId, documentId),
          maxCount: 20,
          windowSeconds: 60,
        },
        {
          ruleKey: "suggestion_mutation:user:minute",
          subjectKey: user,
          maxCount: 60,
          windowSeconds: 60,
        },
      ];
    }
    case "versionMutation": {
      const documentId = requireDocumentId(preset, input.documentId);

      return [
        {
          ruleKey: "version_mutation:document:minute",
          subjectKey: documentSubject(input.userId, documentId),
          maxCount: 5,
          windowSeconds: 60,
        },
        {
          ruleKey: "version_mutation:user:hour",
          subjectKey: user,
          maxCount: 20,
          windowSeconds: 3_600,
        },
      ];
    }
  }
}

export async function enforceRateLimit(
  supabase: SupabaseClient<Database>,
  rules: RateLimitRule[],
): Promise<RateLimitResult[]> {
  const results: RateLimitResult[] = [];

  for (const rule of rules) {
    const { data, error } = await supabase.rpc("consume_rate_limit", {
      p_rule_key: rule.ruleKey,
      p_subject_key: rule.subjectKey,
      p_max_count: rule.maxCount,
      p_window_seconds: rule.windowSeconds,
    });

    if (error) {
      console.error("[rate-limit/consume]", {
        ruleKey: rule.ruleKey,
        message: error.message,
      });
      throw new Error("Could not verify request limits");
    }

    const row = (data?.[0] ?? null) as RateLimitRpcRow | null;

    if (!row) {
      throw new Error("Could not verify request limits");
    }

    const result: RateLimitResult = {
      allowed: row.allowed,
      remaining: row.remaining,
      resetAt: row.reset_at,
      limit: row.limit_count,
      windowSeconds: rule.windowSeconds,
    };

    results.push(result);

    if (!result.allowed) {
      throw new RateLimitExceededError(result);
    }
  }

  return results;
}

export async function enforceRateLimitPreset(
  supabase: SupabaseClient<Database>,
  preset: RateLimitPreset,
  input: BuildRateLimitRulesInput,
): Promise<RateLimitResult[]> {
  return enforceRateLimit(supabase, buildRateLimitRules(preset, input));
}
