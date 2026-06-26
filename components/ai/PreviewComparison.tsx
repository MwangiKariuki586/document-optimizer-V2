"use client";

import { useEffect, useRef } from "react";

import { EditableProposedResult } from "@/components/ai/EditableProposedResult";
import type { PreviewChangeAnchor } from "@/components/ai/ChangeNavigator";
import { ReadOnlyCurrentDocument } from "@/components/ai/ReadOnlyCurrentDocument";
import type { PreviewMode } from "@/components/ai/PreviewModeToggle";
import type { Json } from "@/lib/supabase/types";

type PreviewComparisonProps = {
  mode: PreviewMode;
  syncScroll: boolean;
  currentMarkdown: string;
  currentEditorJson?: Json | null;
  initialProposedMarkdown: string;
  initialProposedEditorJson?: Json | null;
  currentProposedMarkdown: string;
  emptyProposedText: string;
  edited: boolean;
  changes: PreviewChangeAnchor[];
  activeChangeId: string | null;
  onProposedMarkdownChange: (markdown: string) => void;
  onProposedEditedChange: (edited: boolean) => void;
};

function getDocumentMetrics(markdown: string) {
  const trimmed = markdown.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;

  return {
    wordCount,
    characterCount: markdown.length,
  };
}

function getScrollRatio(element: HTMLDivElement): number {
  const maxScroll = element.scrollHeight - element.clientHeight;

  if (maxScroll <= 0) {
    return 0;
  }

  return element.scrollTop / maxScroll;
}

function setScrollRatio(element: HTMLDivElement, ratio: number) {
  const maxScroll = element.scrollHeight - element.clientHeight;
  element.scrollTop = maxScroll > 0 ? maxScroll * ratio : 0;
}

function getAnchorRatio(index: number, textLength: number): number {
  if (index <= 0 || textLength <= 0) {
    return 0;
  }

  return Math.min(1, index / textLength);
}

export function PreviewComparison({
  mode,
  syncScroll,
  currentMarkdown,
  currentEditorJson,
  initialProposedMarkdown,
  initialProposedEditorJson,
  currentProposedMarkdown,
  emptyProposedText,
  edited,
  changes,
  activeChangeId,
  onProposedMarkdownChange,
  onProposedEditedChange,
}: PreviewComparisonProps) {
  const currentPaneRef = useRef<HTMLDivElement | null>(null);
  const proposedPaneRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef(false);
  const currentMetrics = getDocumentMetrics(currentMarkdown);
  const proposedMetrics = getDocumentMetrics(currentProposedMarkdown);

  const syncPaneScroll = (source: "current" | "proposed") => {
    if (!syncScroll || mode !== "side-by-side" || isSyncingRef.current) {
      return;
    }

    const sourceElement =
      source === "current" ? currentPaneRef.current : proposedPaneRef.current;
    const targetElement =
      source === "current" ? proposedPaneRef.current : currentPaneRef.current;

    if (!sourceElement || !targetElement) {
      return;
    }

    isSyncingRef.current = true;
    setScrollRatio(targetElement, getScrollRatio(sourceElement));
    window.requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  useEffect(() => {
    if (!activeChangeId) {
      return;
    }

    const activeChange = changes.find((change) => change.id === activeChangeId);

    if (!activeChange) {
      return;
    }

    const currentRatio = getAnchorRatio(
      activeChange.currentIndex,
      currentMarkdown.length,
    );
    const proposedRatio = getAnchorRatio(
      activeChange.proposedIndex,
      currentProposedMarkdown.length,
    );

    if (currentPaneRef.current) {
      setScrollRatio(currentPaneRef.current, currentRatio);
    }

    if (proposedPaneRef.current) {
      setScrollRatio(proposedPaneRef.current, proposedRatio);
    }
  }, [
    activeChangeId,
    changes,
    currentMarkdown.length,
    currentProposedMarkdown.length,
  ]);

  return (
    <section className="min-h-[540px] min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
      <div
        className={`grid h-full min-h-[540px] gap-3 xl:min-h-0 xl:overflow-hidden ${
          mode === "side-by-side" ? "lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        <ReadOnlyCurrentDocument
          ref={currentPaneRef}
          markdown={currentMarkdown}
          editorJson={currentEditorJson}
          wordCount={currentMetrics.wordCount}
          characterCount={currentMetrics.characterCount}
          hidden={mode === "proposed-only"}
          onScroll={() => syncPaneScroll("current")}
        />
        <EditableProposedResult
          ref={proposedPaneRef}
          initialMarkdown={initialProposedMarkdown}
          initialEditorJson={initialProposedEditorJson}
          emptyText={emptyProposedText}
          edited={edited}
          wordCount={proposedMetrics.wordCount}
          characterCount={proposedMetrics.characterCount}
          onMarkdownChange={onProposedMarkdownChange}
          onEditedChange={onProposedEditedChange}
          onScroll={() => syncPaneScroll("proposed")}
        />
      </div>
    </section>
  );
}
