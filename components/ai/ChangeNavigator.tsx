"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, ListTree } from "lucide-react";

import { SuggestionChangeCard } from "@/components/ai/SuggestionChangeCard";
import type { ChangeSummaryType } from "@/components/ai/ChangeSummary";

export type PreviewChangeAnchor = {
  id: string;
  label: string;
  type: ChangeSummaryType;
  originalText: string;
  suggestedText: string;
  explanation: string | undefined;
  currentIndex: number;
  proposedIndex: number;
};

type ChangeNavigatorProps = {
  changes: PreviewChangeAnchor[];
  activeChangeId: string | null;
  onSelect: (changeId: string) => void;
};

export function ChangeNavigator({
  changes,
  activeChangeId,
  onSelect,
}: ChangeNavigatorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeChangeId || !isOpen) {
      return;
    }

    cardRefs.current[activeChangeId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeChangeId, isOpen]);

  const selectChangeByOffset = (offset: number) => {
    const activeIndex = activeChangeId
      ? changes.findIndex((change) => change.id === activeChangeId)
      : -1;
    const fallbackIndex = offset > 0 ? 0 : changes.length - 1;
    const nextIndex =
      activeIndex < 0
        ? fallbackIndex
        : Math.min(Math.max(activeIndex + offset, 0), changes.length - 1);
    const nextChange = changes[nextIndex];

    if (!nextChange || nextChange.id === activeChangeId) {
      return;
    }

    onSelect(nextChange.id);
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectChangeByOffset(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectChangeByOffset(-1);
    }
  };

  if (changes.length === 0) {
    return null;
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-light bg-surface p-3">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border-light bg-surface-secondary">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
          aria-expanded={isOpen}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <ListTree className="size-4 shrink-0 text-accent" />
            <span className="text-sm font-semibold text-text-primary">
              Changes
            </span>
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
      </div>

      {isOpen ? (
        <div
          className="mt-2 grid min-h-0 min-w-0 flex-1 content-start gap-2 overflow-x-hidden overflow-y-auto pr-2"
          onKeyDown={handleListKeyDown}
          role="listbox"
          aria-label="Proposed changes"
          aria-activedescendant={activeChangeId ?? undefined}
          tabIndex={0}
        >
          {changes.map((change) => (
            <div
              key={change.id}
              id={change.id}
              className="min-w-0 max-w-full"
              role="option"
              aria-selected={activeChangeId === change.id}
              ref={(element) => {
                cardRefs.current[change.id] = element;
              }}
            >
              <SuggestionChangeCard
                change={change}
                active={activeChangeId === change.id}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] leading-4 text-text-muted">
          Expand to review each change and its expected impact.
        </p>
      )}
    </section>
  );
}
