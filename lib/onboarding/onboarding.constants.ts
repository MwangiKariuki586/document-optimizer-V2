export const ONBOARDING_VERSION = 3;

export const ONBOARDING_TIP_KEYS = [
  "document-creation-methods",
  "editor-ai-actions",
  "review-ai-result",
  "version-safety",
  "preview-workspace",
  "versions-workspace",
  "export-document",
  "account-workspace",
] as const;

export type OnboardingTipKey = (typeof ONBOARDING_TIP_KEYS)[number];

export const ONBOARDING_QUERY_KEY = [
  "onboarding",
  ONBOARDING_VERSION,
] as const;
