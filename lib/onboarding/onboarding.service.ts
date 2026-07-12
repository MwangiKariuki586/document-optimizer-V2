import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ONBOARDING_TIP_KEYS,
  ONBOARDING_VERSION,
  type OnboardingTipKey,
} from "@/lib/onboarding/onboarding.constants";
import type {
  OnboardingMilestones,
  OnboardingStage,
  OnboardingState,
  OnboardingUpdate,
} from "@/lib/onboarding/onboarding.types";
import type { Database } from "@/lib/supabase/types";

type OnboardingRow = Database["public"]["Tables"]["user_onboarding"]["Row"];

function validTips(values: string[]): OnboardingTipKey[] {
  return values.filter((value): value is OnboardingTipKey =>
    ONBOARDING_TIP_KEYS.includes(value as OnboardingTipKey),
  );
}

export function resolveOnboardingStage(input: {
  milestones: OnboardingMilestones;
  welcomeDismissed: boolean;
  dismissedTips: OnboardingTipKey[];
  replaying: boolean;
}): OnboardingStage {
  const dismissed = new Set(input.dismissedTips);

  if (input.replaying) {
    if (!input.welcomeDismissed) return "welcome";
    if (!dismissed.has("document-creation-methods")) return "create-document";
    if (!dismissed.has("editor-ai-actions")) return "run-ai";
    if (!dismissed.has("review-ai-result")) return "review-result";
    if (!dismissed.has("version-safety")) return "version-safety";
    if (!dismissed.has("export-document")) return "export-document";
    return "complete";
  }

  if (!input.milestones.hasDocument) {
    return input.welcomeDismissed ? "create-document" : "welcome";
  }
  if (!input.milestones.hasCompletedAIAction) return "run-ai";
  if (!input.milestones.hasAppliedChange) return "review-result";
  if (!dismissed.has("version-safety")) return "version-safety";
  if (!input.milestones.hasExportedDocument) return "export-document";
  return "complete";
}

async function ensureOnboardingRow(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<OnboardingRow> {
  const { data: existing, error: loadError } = await supabase
    .from("user_onboarding")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (loadError) throw new Error("Failed to load onboarding state");
  if (existing?.onboarding_version === ONBOARDING_VERSION) return existing;

  if (existing) {
    const { data, error } = await supabase
      .from("user_onboarding")
      .update({
        onboarding_version: ONBOARDING_VERSION,
        welcome_dismissed_at: null,
        dismissed_tips: [],
        checklist_dismissed_at: null,
        replay_started_at: null,
        completed_at: null,
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) throw new Error("Failed to upgrade onboarding state");
    return data;
  }

  const { data, error } = await supabase
    .from("user_onboarding")
    .insert({ user_id: userId, onboarding_version: ONBOARDING_VERSION })
    .select("*")
    .single();

  if (error || !data) throw new Error("Failed to initialize onboarding state");
  return data;
}

async function deriveMilestones(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<OnboardingMilestones> {
  const [documents, aiRequests, appliedSuggestions, appliedAI, exports] =
    await Promise.all([
      supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("ai_requests").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
      supabase.from("suggestions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "applied"),
      supabase.from("usage_ledger").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("event_type", "ai_action").contains("metadata", { applied: true }),
      supabase.from("exports").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
    ]);

  const error = [documents, aiRequests, appliedSuggestions, appliedAI, exports]
    .find((result) => result.error)?.error;
  if (error) throw new Error("Failed to derive onboarding progress");

  return {
    hasDocument: (documents.count ?? 0) > 0,
    hasCompletedAIAction: (aiRequests.count ?? 0) > 0,
    hasAppliedChange:
      (appliedSuggestions.count ?? 0) > 0 || (appliedAI.count ?? 0) > 0,
    hasExportedDocument: (exports.count ?? 0) > 0,
  };
}

function toState(row: OnboardingRow, milestones: OnboardingMilestones): OnboardingState {
  const dismissedTips = validTips(row.dismissed_tips);
  const replaying = Boolean(
    row.replay_started_at &&
      (!row.completed_at || row.replay_started_at > row.completed_at),
  );
  const stage = resolveOnboardingStage({
    milestones,
    welcomeDismissed: Boolean(row.welcome_dismissed_at),
    dismissedTips,
    replaying,
  });
  const completedCount = Object.values(milestones).filter(Boolean).length;

  return {
    version: row.onboarding_version,
    stage,
    milestones,
    dismissedTips,
    welcomeDismissed: Boolean(row.welcome_dismissed_at),
    checklistDismissed: Boolean(row.checklist_dismissed_at),
    replaying,
    completed: stage === "complete",
    completedCount,
    totalCount: 4,
  };
}

export async function getOnboardingState(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<OnboardingState> {
  const [row, milestones] = await Promise.all([
    ensureOnboardingRow(supabase, userId),
    deriveMilestones(supabase, userId),
  ]);
  return toState(row, milestones);
}

export async function updateOnboardingState(
  supabase: SupabaseClient<Database>,
  userId: string,
  update: OnboardingUpdate,
): Promise<OnboardingState> {
  const row = await ensureOnboardingRow(supabase, userId);
  const now = new Date().toISOString();
  const values: Database["public"]["Tables"]["user_onboarding"]["Update"] = {};

  if (update.action === "dismiss-welcome") values.welcome_dismissed_at = now;
  if (update.action === "dismiss-checklist") values.checklist_dismissed_at = now;
  if (update.action === "dismiss-tip") {
    values.dismissed_tips = Array.from(new Set([...row.dismissed_tips, update.tip]));
  }
  if (update.action === "restart-guide") {
    values.welcome_dismissed_at = null;
    values.dismissed_tips = [];
    values.checklist_dismissed_at = null;
    values.replay_started_at = now;
    values.completed_at = null;
    values.onboarding_version = ONBOARDING_VERSION;
  }

  const { error } = await supabase
    .from("user_onboarding")
    .update(values)
    .eq("user_id", userId);
  if (error) throw new Error("Failed to update onboarding state");

  return getOnboardingState(supabase, userId);
}
