"use client";

import { useRouter } from "next/navigation";
import { FileUp, Sparkles, X } from "lucide-react";
import { newDocumentHref } from "@/lib/documents/new-document.routes";
import { useOnboarding } from "@/lib/onboarding/onboarding.query";

export function WelcomeGuide() {
  const router = useRouter();
  const { update, isUpdating } = useOnboarding();
  const dismiss = () => update({ action: "dismiss-welcome" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-welcome-title">
      <div className="absolute inset-0 bg-overlay-muted" aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-popover">
        <button type="button" onClick={dismiss} disabled={isUpdating} className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary" aria-label="Dismiss welcome guide"><X className="size-4" /></button>
        <div className="flex size-11 items-center justify-center rounded-lg bg-accent-light text-accent"><Sparkles className="size-5" /></div>
        <h2 id="onboarding-welcome-title" className="mt-5 text-xl font-semibold text-text-primary">Create a stronger document</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">Start with a file or pasted text. You will review every AI change before it affects your document.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { dismiss(); router.push(newDocumentHref("upload")); }} className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"><FileUp className="size-4" />Add your first document</button>
          <button type="button" onClick={dismiss} disabled={isUpdating} className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary">Explore first</button>
        </div>
      </div>
    </div>
  );
}
