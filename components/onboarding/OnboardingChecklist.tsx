"use client";

import Link from "next/link";
import { Check, ChevronRight, X } from "lucide-react";
import { newDocumentHref } from "@/lib/documents/new-document.routes";
import { useOnboarding } from "@/lib/onboarding/onboarding.query";
import type { OnboardingState } from "@/lib/onboarding/onboarding.types";

export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  const { update } = useOnboarding();
  const steps = [
    { label: "Add a document", done: state.milestones.hasDocument, href: newDocumentHref("upload") },
    { label: "Run an AI improvement", done: state.milestones.hasCompletedAIAction, href: "/documents" },
    { label: "Apply a reviewed change", done: state.milestones.hasAppliedChange, href: "/documents" },
    { label: "Export the finished document", done: state.milestones.hasExportedDocument, href: "/documents" },
  ];
  return (
    <aside className="fixed bottom-5 right-5 z-40 w-[min(340px,calc(100vw-2.5rem))] rounded-lg border border-border bg-surface p-4 shadow-popover" aria-label="Getting started checklist">
      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-text-primary">Getting started</p><p className="mt-0.5 text-xs text-text-muted">{state.completedCount} of {state.totalCount} complete</p></div>{state.completed ? <button type="button" onClick={() => update({ action: "dismiss-checklist" })} className="inline-flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-secondary" aria-label="Dismiss checklist"><X className="size-4" /></button> : null}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-tertiary"><div className="h-full bg-accent transition-all" style={{ width: `${(state.completedCount / state.totalCount) * 100}%` }} /></div>
      <div className="mt-3 divide-y divide-border-light">{steps.map((step) => step.done ? <div key={step.label} className="flex min-h-10 items-center gap-3 py-2 text-sm text-text-muted"><span className="flex size-5 items-center justify-center rounded-full bg-success-muted text-success-foreground"><Check className="size-3" /></span><span>{step.label}</span></div> : <Link key={step.label} href={step.href} className="flex min-h-10 items-center gap-3 py-2 text-sm font-medium text-text-primary transition hover:text-accent"><span className="size-5 rounded-full border border-border" /><span className="flex-1">{step.label}</span><ChevronRight className="size-4" /></Link>)}</div>
    </aside>
  );
}
