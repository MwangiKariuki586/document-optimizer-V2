"use client";

import { useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";

import type { ChangeSummaryType } from "@/components/ai/ChangeSummary";

export type PreviewChangeAnchor = {
  id: string;
  label: string;
  type: ChangeSummaryType;
  currentIndex: number;
  proposedIndex: number;
};

type ChangeNavigatorProps = {
  changes: PreviewChangeAnchor[];
  activeChangeId: string | null;
  onSelect: (changeId: string) => void;
};

const typeLabels: Record<ChangeSummaryType, string> = {
  clarity: "Clarity",
  grammar: "Grammar",
  tone: "Tone",
  structure: "Structure",
  seo: "SEO",
};

export function ChangeNavigator({
  changes,
  activeChangeId,
  onSelect,
}: ChangeNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (changes.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border-light bg-surface p-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <ListTree className="size-4 shrink-0 text-accent" />
          <span className="text-sm font-semibold text-text-primary">Changes</span>
          <span className="rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent">
            {changes.length}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-text-muted transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="mt-3 grid max-h-56 gap-1.5 overflow-y-auto pr-1">
          {changes.map((change, index) => (
            <button
              key={change.id}
              type="button"
              onClick={() => onSelect(change.id)}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                activeChangeId === change.id
                  ? "border-accent bg-accent-muted"
                  : "border-border-light bg-surface-secondary hover:border-border-strong"
              }`}
            >
              <span className="block text-xs font-semibold text-text-primary">
                {index + 1}. {change.label}
              </span>
              <span className="mt-1 block text-[11px] text-text-muted">
                {typeLabels[change.type]}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-4 text-text-muted">
          Expand to jump between proposed edits.
        </p>
      )}
    </section>
  );
}
