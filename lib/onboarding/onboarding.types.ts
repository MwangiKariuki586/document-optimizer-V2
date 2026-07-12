import type { OnboardingTipKey } from "@/lib/onboarding/onboarding.constants";

export type OnboardingMilestones = {
  hasDocument: boolean;
  hasCompletedAIAction: boolean;
  hasAppliedChange: boolean;
  hasExportedDocument: boolean;
};

export type OnboardingStage =
  | "welcome"
  | "create-document"
  | "run-ai"
  | "review-result"
  | "version-safety"
  | "export-document"
  | "complete";

export type OnboardingState = {
  version: number;
  stage: OnboardingStage;
  milestones: OnboardingMilestones;
  dismissedTips: OnboardingTipKey[];
  welcomeDismissed: boolean;
  checklistDismissed: boolean;
  replaying: boolean;
  completed: boolean;
  completedCount: number;
  totalCount: number;
};

export type OnboardingUpdate =
  | { action: "dismiss-welcome" }
  | { action: "dismiss-tip"; tip: OnboardingTipKey }
  | { action: "dismiss-checklist" }
  | { action: "restart-guide" };
