import { describe, expect, it } from "vitest";
import { resolveOnboardingStage } from "@/lib/onboarding/onboarding.service";

const none = {
  hasDocument: false,
  hasCompletedAIAction: false,
  hasAppliedChange: false,
  hasExportedDocument: false,
};

describe("resolveOnboardingStage", () => {
  it("starts new users at welcome and advances progressively", () => {
    expect(resolveOnboardingStage({ milestones: none, welcomeDismissed: false, dismissedTips: [], replaying: false })).toBe("welcome");
    expect(resolveOnboardingStage({ milestones: none, welcomeDismissed: true, dismissedTips: [], replaying: false })).toBe("create-document");
    expect(resolveOnboardingStage({ milestones: { ...none, hasDocument: true }, welcomeDismissed: true, dismissedTips: [], replaying: false })).toBe("run-ai");
  });

  it("requires review, version safety, and export in order", () => {
    const ai = { ...none, hasDocument: true, hasCompletedAIAction: true };
    expect(resolveOnboardingStage({ milestones: ai, welcomeDismissed: true, dismissedTips: [], replaying: false })).toBe("review-result");
    expect(resolveOnboardingStage({ milestones: { ...ai, hasAppliedChange: true }, welcomeDismissed: true, dismissedTips: [], replaying: false })).toBe("version-safety");
    expect(resolveOnboardingStage({ milestones: { ...ai, hasAppliedChange: true }, welcomeDismissed: true, dismissedTips: ["version-safety"], replaying: false })).toBe("export-document");
  });

  it("replays dismissed guidance without clearing real milestones", () => {
    const complete = { hasDocument: true, hasCompletedAIAction: true, hasAppliedChange: true, hasExportedDocument: true };
    expect(resolveOnboardingStage({ milestones: complete, welcomeDismissed: false, dismissedTips: [], replaying: true })).toBe("welcome");
  });
});
