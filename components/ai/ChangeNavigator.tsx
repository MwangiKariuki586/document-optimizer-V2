import { ListTree } from "lucide-react";

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
  if (changes.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:p-3">
      <div className="flex items-center gap-2">
        <ListTree className="size-4 text-accent" />
        <h2 className="text-sm font-semibold text-text-primary">Changes</h2>
      </div>
      <div className="mt-3 grid gap-1.5">
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
    </section>
  );
}
