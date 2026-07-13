"use client";

import { usePathname, useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";
import { ContextualTip } from "@/components/onboarding/ContextualTip";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { WelcomeGuide } from "@/components/onboarding/WelcomeGuide";
import { useOnboarding } from "@/lib/onboarding/onboarding.query";

export function ProgressiveOnboarding() {
  const pathname = usePathname();
  const router = useRouter();
  const { data, updateAsync, isPending } = useOnboarding();
  if (isPending || !data) return null;

  const isDashboard = pathname === "/dashboard";
  const isNewDocument = pathname === "/documents/new";
  const isEditor = /^\/documents\/[^/]+$/.test(pathname);
  const isPreview = /^\/documents\/[^/]+\/preview$/.test(pathname);
  const isVersions = /^\/documents\/[^/]+\/versions$/.test(pathname);
  const isExport = /^\/documents\/[^/]+\/export$/.test(pathname);
  const isAccount = pathname === "/account";
  const isTipVisible = (tip: (typeof data.dismissedTips)[number]) =>
    !data.dismissedTips.includes(tip);
  let guide: React.ReactNode = null;

  if (isNewDocument && isTipVisible("document-creation-methods")) guide = <ContextualTip tip="document-creation-methods" title="Choose how to begin" description="Upload preserves the original file. Paste Text is fastest when you already have editable content." />;
  else if (isPreview && isTipVisible("preview-workspace")) guide = <ContextualTip tip="preview-workspace" title="Compare before you continue" description="Review the current and proposed content side by side. Return to the editor to apply changes, or export an eligible AI result directly." />;
  else if (isVersions && isTipVisible("versions-workspace")) guide = <ContextualTip tip="versions-workspace" title="Review your document history" description="Select a saved version to compare it with the current document. Restoring creates a safety copy of the current state first." />;
  else if (isExport && isTipVisible("export-document")) guide = <ContextualTip tip="export-document" title="Prepare a private export" description="Choose the output format and options, then generate a private download. Completed exports remain available in your document history." />;
  else if (isAccount && isTipVisible("account-workspace")) guide = <ContextualTip tip="account-workspace" title="Review account activity" description="Use this workspace to inspect AI usage, processed documents, storage, recent activity, and account security." />;
  else if (data.stage === "welcome" && isDashboard) guide = <WelcomeGuide />;
  else if (data.stage === "run-ai" && isEditor && isTipVisible("editor-ai-actions")) guide = <ContextualTip tip="editor-ai-actions" title="Run your first improvement" description="Choose one focused AI action. Your document will not change until you review the result." />;
  else if (data.stage === "review-result" && isEditor && isTipVisible("review-ai-result")) guide = <ContextualTip tip="review-ai-result" title="Review before applying" description="Inspect the proposed result or individual suggestions, then apply only the changes you want." />;
  else if (data.stage === "version-safety" && isEditor) guide = <ContextualTip tip="version-safety" title="Your previous version is safe" description="Applied AI changes create a recovery point, so you can restore earlier content from Versions." actionLabel="View versions" actionHref={`${pathname}/versions`} />;
  else if (isDashboard && !data.checklistDismissed && data.stage !== "welcome") guide = <OnboardingChecklist state={data} />;

  return (
    <>
      {guide}
      <button type="button" onClick={async () => { await updateAsync({ action: "restart-guide" }); router.push("/dashboard"); }} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-30 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-card-soft transition hover:bg-surface-secondary hover:text-text-primary md:bottom-5 md:left-20" title="Restart getting started guide" aria-label="Restart getting started guide"><CircleHelp className="size-4" /></button>
    </>
  );
}
