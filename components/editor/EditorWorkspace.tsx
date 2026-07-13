"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, type JSONContent } from "@tiptap/react";
import { Sparkles, TriangleAlert } from "lucide-react";

import { editorExtensions } from "@/lib/editor/editor-extensions";

import { AIActionsPanel } from "@/components/ai/AIActionsPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorAssistantSheet } from "@/components/editor/EditorAssistantSheet";
import { EditorStatusBar } from "@/components/editor/EditorStatusBar";
import {
  EditorSuggestion,
  EditorSuggestionsPanel,
  SuggestionFilter,
} from "@/components/editor/EditorSuggestionsPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { FidelityBadge, FidelityStatus } from "@/components/documents/FidelityBadge";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { appToast } from "@/lib/feedback/toast";
import { useInvalidateOnboarding } from "@/lib/onboarding/onboarding.query";
import { countWords } from "@/lib/documents/text-to-editor";
import type { EditorDocument } from "@/lib/documents/document.types";
import type {
  AIActionRun,
  AIActionKey,
  AIActionOptions,
  AIActionResult,
} from "@/lib/ai/ai.types";
import { mapDocumentSuggestionsToEditorSuggestions } from "@/lib/suggestions/suggestions.mapper";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import {
  findSuggestionHighlightRanges,
  SuggestionHighlight,
  type SuggestionHighlightCategory,
  suggestionHighlightPluginKey,
} from "@/lib/editor/suggestion-highlight";

type EditorWorkspaceProps = {
  document: EditorDocument;
  initialSuggestions: DocumentSuggestion[];
  initialAIActionRuns: AIActionRun[];
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export type SaveState = "saved" | "dirty" | "saving";

type RightPanelMode = "suggestions" | "ai-actions";

type RunAIActionResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    status: "completed";
    result: AIActionResult;
    suggestions: DocumentSuggestion[];
  };
};

type IgnoreSuggestionResponse = {
  success: boolean;
  error?: string;
  data?: {
    suggestionId: string;
  };
};

type ApplySuggestionResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    suggestionId: string;
    versionNumber: number;
    currentMarkdown: string;
    editorJson: JSONContent;
    wordCount: number;
    serverTimings?: Record<string, number>;
  };
};

type ApplyAllSuggestionsResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    appliedCount: number;
    versionNumber: number;
    currentMarkdown: string;
    editorJson: JSONContent;
    wordCount: number;
  };
};

type RestoreVersionResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    selectedVersionNumber: number;
    restoredVersionNumber: number;
    currentMarkdown: string;
    editorJson: JSONContent;
    wordCount: number;
  };
};

const FORMATTING_WARNING: Record<string, string> = {
  "Limited Formatting":
    "Some original formatting could not be fully converted for editing. Your original file is preserved and can be exported.",
  "Formatting Review Needed":
    "This document may need a formatting review before export. Your original file is preserved.",
};

const SUGGESTION_CATEGORY_BY_LABEL: Record<
  EditorSuggestion["type"],
  SuggestionHighlightCategory
> = {
  Clarity: "clarity",
  Conciseness: "conciseness",
  Formatting: "formatting",
  Grammar: "grammar",
  Tone: "tone",
  Structure: "structure",
};

export function EditorWorkspace({
  document,
  initialSuggestions,
  initialAIActionRuns,
}: EditorWorkspaceProps) {
  const router = useRouter();
  const invalidateOnboarding = useInvalidateOnboarding();
  const initialContent = useMemo<JSONContent>(
    () =>
      (document.editorJson as JSONContent | null) ?? {
        type: "doc",
        content: [],
      },
    [document.editorJson],
  );

  const [title, setTitle] = useState(document.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [versionNumber, setVersionNumber] = useState(document.versionNumber);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanelMode>(() =>
    initialSuggestions.length > 0 ? "suggestions" : "ai-actions",
  );
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const isDesktopAssistant = useMediaQuery("(min-width: 1280px)");

  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("pending");
  const [activeRunId, setActiveRunId] = useState(
    initialAIActionRuns[0]?.id ?? "all",
  );
  const [aiActionRuns, setAIActionRuns] =
    useState<AIActionRun[]>(initialAIActionRuns);
  const [suggestions, setSuggestions] = useState<EditorSuggestion[]>(() =>
    mapDocumentSuggestionsToEditorSuggestions(initialSuggestions),
  );
  const [applyingSuggestionId, setApplyingSuggestionId] = useState<string | null>(
    null,
  );
  const [ignoringSuggestionId, setIgnoringSuggestionId] = useState<string | null>(
    null,
  );
  const [isReviewingAll, setIsReviewingAll] = useState(false);
  const [isReviewingSelected, setIsReviewingSelected] = useState(false);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(
    null,
  );
  const [counts, setCounts] = useState({
    words: document.wordCount,
    characters: document.currentMarkdown.length,
  });
  const [, setSelectionTick] = useState(0);

  const handleHighlightClick = useCallback((suggestionId: string) => {
    setActiveSuggestionId(suggestionId);
    setSuggestionsOpen(true);
    setRightPanel("suggestions");
    setAssistantOpen(true);
  }, []);

  const workspaceEditorExtensions = useMemo(
    () => [
      ...editorExtensions,
      SuggestionHighlight.configure({ onHighlightClick: handleHighlightClick }),
    ],
    [handleHighlightClick],
  );

  const editor = useEditor({
    extensions: workspaceEditorExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ProseMirror-doc focus:outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const text = instance.getText();
      setCounts({ words: countWords(text), characters: text.length });
      setSaveState((current) => (current === "saving" ? current : "dirty"));
    },
    onSelectionUpdate: () => {
      setSelectionTick((tick) => tick + 1);
    },
  });

  const focusSuggestionInEditor = useCallback(
    (suggestionId: string) => {
      setActiveSuggestionId(suggestionId);
      setSuggestionsOpen(true);
      setRightPanel("suggestions");

      if (!editor) {
        return;
      }

      const highlightState = suggestionHighlightPluginKey.getState(editor.state);
      const range = highlightState?.ranges.find(
        (item) => item.id === suggestionId,
      );

      if (!range) {
        return;
      }

      editor
        .chain()
        .focus()
        .setTextSelection({ from: range.from, to: range.to })
        .scrollIntoView()
        .run();
    },
    [editor],
  );

  const editorDoc = editor?.state.doc ?? null;
  const suggestionHighlightRanges = useMemo(() => {
    if (!editorDoc) {
      return [];
    }

    const pendingSuggestions = suggestions
      .filter((suggestion) => suggestion.status === "pending")
      .map((suggestion) => ({
        id: suggestion.id,
        originalText: suggestion.originalText,
        category: SUGGESTION_CATEGORY_BY_LABEL[suggestion.type],
        issueLabel: suggestion.explanation || suggestion.type,
      }));

    return findSuggestionHighlightRanges(editorDoc, pendingSuggestions);
  }, [editorDoc, suggestions]);

  const highlightedSuggestionIds = useMemo(
    () => new Set(suggestionHighlightRanges.map((range) => range.id)),
    [suggestionHighlightRanges],
  );

  const isLiveApplyableSuggestion = useCallback(
    (suggestion: EditorSuggestion) =>
      suggestion.status === "pending" && highlightedSuggestionIds.has(suggestion.id),
    [highlightedSuggestionIds],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setSuggestionHighlights(suggestionHighlightRanges);
  }, [editor, suggestionHighlightRanges]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setActiveSuggestionHighlight(activeSuggestionId);
  }, [activeSuggestionId, editor]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSaveState((current) => (current === "saving" ? current : "dirty"));
  };

  const handleSave = async () => {
    if (!editor || saveState === "saving") {
      return;
    }

    setSaveState("saving");

    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          editorJson: editor.getJSON(),
          currentMarkdown: editor.getMarkdown(),
        }),
      });

      const data: { success: boolean; error?: string } = await response.json();

      if (!response.ok || !data.success) {
        setSaveState("dirty");
        appToast.error(data.error ?? "Could not save your changes.");
        return;
      }

      setSaveState("saved");
      router.refresh();
      appToast.success("Document saved.");
    } catch {
      setSaveState("dirty");
      appToast.error("Could not save your changes. Please try again.");
    }
  };

  const handleCreateVersion = async () => {
    if (!editor || isCreatingVersion) {
      return;
    }

    setIsCreatingVersion(true);

    try {
      const response = await fetch(`/api/documents/${document.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          editorJson: editor.getJSON(),
          currentMarkdown: editor.getMarkdown(),
        }),
      });

      const data: {
        success: boolean;
        error?: string;
        data?: { versionNumber: number };
      } = await response.json();

      if (!response.ok || !data.success) {
        appToast.error(data.error ?? "Could not save a version.");
        return;
      }

      if (data.data) {
        setVersionNumber(data.data.versionNumber);
      }
      setSaveState("saved");
      router.refresh();
      appToast.success("Version saved.");
    } catch {
      appToast.error("Could not save a version. Please try again.");
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRunAIAction = async (input: {
    action: AIActionKey;
    options: AIActionOptions;
  }) => {
    if (!editor) {
      throw new Error("The editor is still loading. Please try again.");
    }

    const response = await fetch(`/api/documents/${document.id}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: input.action,
        options: input.options,
        contentMarkdown: editor.getMarkdown(),
      }),
    });

    const data: RunAIActionResponse = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error ?? "Could not run AI action.");
    }

    const newSuggestions = mapDocumentSuggestionsToEditorSuggestions(
      data.data.suggestions,
    );
    setSuggestions((current) => {
      const existingIds = new Set(current.map((suggestion) => suggestion.id));
      const merged = [
        ...current,
        ...newSuggestions.filter(
          (suggestion) => !existingIds.has(suggestion.id),
        ),
      ];

      return merged.map((suggestion, index) => ({
        ...suggestion,
        index: index + 1,
      }));
    });

    const nextPendingSuggestions = newSuggestions.filter(
      (suggestion) => suggestion.status === "pending",
    );

    const completedAt = new Date().toISOString();
    setAIActionRuns((current) => [
      {
        id: data.data!.id,
        action: data.data!.result.action,
        status: "completed",
        summary: data.data!.result.summary,
        suggestionCount: newSuggestions.length,
        createdAt: completedAt,
        completedAt,
      },
      ...current.filter((run) => run.id !== data.data!.id),
    ]);
    const workflow = data.data.result.output.workflow ?? data.data.result.mode;
    const hasInlineSuggestions =
      workflow === "inline_suggestions" && nextPendingSuggestions.length > 0;

    if (hasInlineSuggestions || workflow !== "inline_suggestions") {
      setActiveRunId(data.data.id);
      setActiveTypeFilter("all");
    }

    if (hasInlineSuggestions) {
      setRightPanel("suggestions");
      setSuggestionsOpen(true);
      appToast.success("AI suggestions are ready for review.");
    } else if (workflow === "inline_suggestions") {
      const hasExistingSuggestions = suggestions.length > 0;

      if (hasExistingSuggestions) {
        setActiveRunId("all");
        setActiveTypeFilter("all");
        setActiveStatusFilter("all");
      }

      setRightPanel(hasExistingSuggestions ? "suggestions" : "ai-actions");
      setSuggestionsOpen(true);
      appToast.info("No new reviewable suggestions were found.");
    } else {
      setRightPanel("ai-actions");
      appToast.success("AI result is ready for review.");
    }

    router.refresh();
    void invalidateOnboarding();

    return {
      id: data.data.id,
      summary: data.data.result.summary,
      previewHref: `/documents/${document.id}/preview?requestId=${data.data.id}`,
      suggestionCount: newSuggestions.length,
      workflow:
        data.data.result.output.workflow ??
        (data.data.result.mode === "suggestions"
          ? "inline_suggestions"
          : "result_preview"),
      resultMode: data.data.result.output.resultMode,
    };
  };

  const runScopedSuggestions = useMemo(
    () =>
      activeRunId === "all"
        ? suggestions
        : suggestions.filter(
            (suggestion) => suggestion.aiRequestId === activeRunId,
          ),
    [activeRunId, suggestions],
  );

  const statusFilters = useMemo<SuggestionFilter[]>(() => {
    const counts = runScopedSuggestions.reduce<Record<string, number>>(
      (result, suggestion) => {
        if (suggestion.status === "pending") {
          if (isLiveApplyableSuggestion(suggestion)) {
            result.pending = (result.pending ?? 0) + 1;
          }

          return result;
        }

        result[suggestion.status] = (result[suggestion.status] ?? 0) + 1;
        return result;
      },
      {},
    );

    return [
      { key: "all", label: "All", count: runScopedSuggestions.length },
      { key: "pending", label: "Pending", count: counts.pending ?? 0 },
      { key: "applied", label: "Applied", count: counts.applied ?? 0 },
      { key: "ignored", label: "Ignored", count: counts.ignored ?? 0 },
    ].filter(
      (filter) =>
        filter.key === "all" || filter.key === "pending" || filter.count > 0,
    );
  }, [isLiveApplyableSuggestion, runScopedSuggestions]);

  const effectiveStatusFilter = statusFilters.some(
    (filter) => filter.key === activeStatusFilter,
  )
    ? activeStatusFilter
    : "all";

  const statusScopedSuggestions = useMemo(
    () => {
      if (effectiveStatusFilter === "pending") {
        return runScopedSuggestions.filter(isLiveApplyableSuggestion);
      }

      return effectiveStatusFilter === "all"
        ? runScopedSuggestions
        : runScopedSuggestions.filter(
            (suggestion) => suggestion.status === effectiveStatusFilter,
          );
    },
    [effectiveStatusFilter, isLiveApplyableSuggestion, runScopedSuggestions],
  );

  const typeFilters = useMemo<SuggestionFilter[]>(() => {
    const typeCounts = statusScopedSuggestions.reduce<Record<string, number>>(
      (countsByType, suggestion) => {
        const key = suggestion.type.toLowerCase();
        countsByType[key] = (countsByType[key] ?? 0) + 1;
        return countsByType;
      },
      {},
    );

    return [
      { key: "grammar", label: "Grammar", count: typeCounts.grammar ?? 0 },
      { key: "clarity", label: "Clarity", count: typeCounts.clarity ?? 0 },
      {
        key: "tone",
        label: "Tone",
        count: (typeCounts.tone ?? 0) + (typeCounts.style ?? 0),
      },
      {
        key: "conciseness",
        label: "Conciseness",
        count: typeCounts.conciseness ?? 0,
      },
      { key: "structure", label: "Structure", count: typeCounts.structure ?? 0 },
      {
        key: "formatting",
        label: "Formatting",
        count: typeCounts.formatting ?? 0,
      },
    ].filter((filter) => filter.key === "all" || filter.count > 0);
  }, [statusScopedSuggestions]);

  const effectiveTypeFilter = typeFilters.some(
    (filter) => filter.key === activeTypeFilter,
  )
    ? activeTypeFilter
    : "all";

  const visibleSuggestions = useMemo(
    () => {
      const matches =
        effectiveTypeFilter === "all"
        ? statusScopedSuggestions
        : statusScopedSuggestions.filter(
            (suggestion) =>
              suggestion.type.toLowerCase() === effectiveTypeFilter,
          );

      return [...matches].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
    },
    [effectiveTypeFilter, statusScopedSuggestions],
  );

  const filteredSuggestions = useMemo(
    () =>
      visibleSuggestions.map((suggestion) => ({
        ...suggestion,
        hasInlineHighlight: highlightedSuggestionIds.has(suggestion.id),
      })),
    [highlightedSuggestionIds, visibleSuggestions],
  );

  const appliedSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === "applied",
  ).length;
  const scopedPendingSuggestions = runScopedSuggestions.filter(
    isLiveApplyableSuggestion,
  );
  const scopedAppliedSuggestionCount = runScopedSuggestions.filter(
    (suggestion) => suggestion.status === "applied",
  ).length;
  const currentEditorText = editor?.getText() ?? document.currentMarkdown;
  const handleApplySuggestion = async (id: string) => {
    if (!editor) {
      appToast.error("The editor is still loading. Please try again.");
      return;
    }

    const targetSuggestion = suggestions.find((suggestion) => suggestion.id === id);
    const beforeApplyContent = editor.getJSON();
    const beforeApplyCounts = { ...counts };
    const beforeApplySaveState = saveState;
    const highlightState = suggestionHighlightPluginKey.getState(editor.state);
    const range = highlightState?.ranges.find((item) => item.id === id);
    let appliedOptimistically = false;

    if (!targetSuggestion || targetSuggestion.status !== "pending" || !range) {
      appToast.warning(
        "This suggestion no longer matches one unique editor range. Regenerate suggestions or ignore it.",
      );
      return;
    }

    setApplyingSuggestionId(id);

    try {
      if (targetSuggestion && range) {
        const currentText = editor.state.doc.textBetween(range.from, range.to);

        if (currentText === targetSuggestion.originalText) {
          editor
            .chain()
            .focus()
            .insertContentAt(
              { from: range.from, to: range.to },
              targetSuggestion.suggestedText,
            )
            .run();
          appliedOptimistically = true;
          setCounts({
            words: countWords(editor.getText()),
            characters: editor.getText().length,
          });
          setActiveSuggestionId(null);
          setSuggestions((current) =>
            current.map((suggestion) =>
              suggestion.id === id
                ? { ...suggestion, status: "applied" }
                : suggestion,
            ),
          );
          setApplyingSuggestionId((currentId) =>
            currentId === id ? null : currentId,
          );
        }
      }

      const response = await fetch(
        `/api/documents/${document.id}/suggestions/${id}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data: ApplySuggestionResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        if (appliedOptimistically) {
          editor.commands.setContent(beforeApplyContent);
          setCounts(beforeApplyCounts);
          setSaveState(beforeApplySaveState);
          setSuggestions((current) =>
            current.map((suggestion) =>
              suggestion.id === id
                ? { ...suggestion, status: "pending" }
                : suggestion,
            ),
          );
        }
        appToast.error(data.error ?? "Could not apply suggestion.");
        return;
      }

      if (!appliedOptimistically) {
        editor.commands.setContent(data.data.editorJson);
      }
      setCounts({
        words: data.data.wordCount,
        characters: data.data.currentMarkdown.length,
      });
      setVersionNumber(data.data.versionNumber);
      setSaveState("saved");
      if (!appliedOptimistically) {
        setActiveSuggestionId(null);
        setSuggestions((current) =>
          current.map((suggestion) =>
            suggestion.id === id
              ? { ...suggestion, status: "applied" }
              : suggestion,
          ),
        );
      }
      router.refresh();
      void invalidateOnboarding();
      appToast.success("Suggestion applied. Your rollback point is preserved.");
    } catch {
      if (appliedOptimistically) {
        editor.commands.setContent(beforeApplyContent);
        setCounts(beforeApplyCounts);
        setSaveState(beforeApplySaveState);
        setSuggestions((current) =>
          current.map((suggestion) =>
            suggestion.id === id
              ? { ...suggestion, status: "pending" }
              : suggestion,
          ),
        );
      }
      appToast.error("Could not apply suggestion. Please try again.");
    } finally {
      setApplyingSuggestionId((currentId) =>
        currentId === id ? null : currentId,
      );
    }
  };

  const handleRestoreVersion = async (targetVersionNumber: number) => {
    if (!editor) {
      const message = "The editor is still loading. Please try again.";
      appToast.error(message);
      throw new Error(message);
    }

    let toastShown = false;

    try {
      const response = await fetch(
        `/api/documents/${document.id}/versions/${targetVersionNumber}/restore`,
        { method: "POST" },
      );
      const data: RestoreVersionResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        const message = data.error ?? "Could not restore this version.";
        appToast.error(message);
        toastShown = true;
        throw new Error(message);
      }

      editor.commands.setContent(data.data.editorJson);
      setCounts({
        words: data.data.wordCount,
        characters: data.data.currentMarkdown.length,
      });
      setVersionNumber(data.data.restoredVersionNumber);
      setSaveState("saved");
      setActiveSuggestionId(null);
      router.refresh();
      void invalidateOnboarding();
      appToast.success(
        `Switched to version v${data.data.selectedVersionNumber}.`,
      );
    } catch (error) {
      if (!toastShown) {
        appToast.error("Could not restore this version. Please try again.");
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Could not restore this version.");
    }
  };

  const handleIgnoreSuggestion = async (id: string) => {
    setIgnoringSuggestionId(id);
    setActiveSuggestionId((current) => (current === id ? null : current));
    setSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.id === id ? { ...suggestion, status: "ignored" } : suggestion,
      ),
    );

    try {
      const response = await fetch(
        `/api/documents/${document.id}/suggestions/${id}/ignore`,
        { method: "POST" },
      );
      const data: IgnoreSuggestionResponse = await response.json();

      if (!response.ok || !data.success) {
        setSuggestions((current) =>
          current.map((suggestion) =>
            suggestion.id === id
              ? { ...suggestion, status: "pending" }
              : suggestion,
          ),
        );
        appToast.error(data.error ?? "Could not ignore suggestion.");
        return;
      }

      appToast.info("Suggestion ignored.");
      router.refresh();
    } catch {
      setSuggestions((current) =>
        current.map((suggestion) =>
          suggestion.id === id ? { ...suggestion, status: "pending" } : suggestion,
        ),
      );
      appToast.error("Could not ignore suggestion. Please try again.");
    } finally {
      setIgnoringSuggestionId(null);
    }
  };

  const handleReviewAppliedSuggestions = () => {
    if (appliedSuggestionCount === 0) {
      return;
    }

    setIsReviewingSelected(true);
    router.push(`/documents/${document.id}/preview?applied=1`);
  };

  const handleApplyAllSuggestions = async () => {
    if (!editor || scopedPendingSuggestions.length === 0) {
      return;
    }

    const pendingIds = scopedPendingSuggestions.map(
      (suggestion) => suggestion.id,
    );
    setIsReviewingAll(true);

    try {
      const response = await fetch(
        `/api/documents/${document.id}/suggestions/apply-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suggestionIds: pendingIds }),
        },
      );
      const data: ApplyAllSuggestionsResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        appToast.error(data.error ?? "Could not apply all suggestions.");
        return;
      }

      editor.commands.setContent(data.data.editorJson);
      setCounts({
        words: data.data.wordCount,
        characters: data.data.currentMarkdown.length,
      });
      setVersionNumber(data.data.versionNumber);
      setSaveState("saved");
      setActiveSuggestionId(null);
      setSuggestions((current) =>
        current.map((suggestion) =>
          pendingIds.includes(suggestion.id)
            ? { ...suggestion, status: "applied" }
            : suggestion,
        ),
      );
      router.refresh();
      appToast.success(
        `${data.data.appliedCount} suggestions applied. A version snapshot was created first.`,
      );
    } catch {
      appToast.error("Could not apply all suggestions. Please try again.");
    } finally {
      setIsReviewingAll(false);
    }
  };

  const fidelityStatus = document.fidelityStatus as FidelityStatus;
  const formattingWarning = FORMATTING_WARNING[document.fidelityStatus];
  const assistantPanel =
    rightPanel === "ai-actions" ? (
      <AIActionsPanel
        onShowSuggestions={() => setRightPanel("suggestions")}
        suggestionCount={suggestions.length}
        onRunAction={handleRunAIAction}
      />
    ) : (
      <EditorSuggestionsPanel
        documentId={document.id}
        open={suggestionsOpen}
        onReopen={() => setSuggestionsOpen(true)}
        onOpenAIActions={() => setRightPanel("ai-actions")}
        suggestions={filteredSuggestions}
        allSuggestions={suggestions}
        actionRuns={aiActionRuns}
        activeRunId={activeRunId}
        onRunChange={(runId) => {
          setActiveRunId(runId);
          setActiveStatusFilter("all");
          setActiveTypeFilter("all");
        }}
        statusFilters={statusFilters}
        activeStatusFilter={effectiveStatusFilter}
        onStatusFilterChange={setActiveStatusFilter}
        typeFilters={typeFilters}
        activeTypeFilter={effectiveTypeFilter}
        onTypeFilterChange={setActiveTypeFilter}
        onApplySuggestion={handleApplySuggestion}
        onReviewAppliedSuggestions={handleReviewAppliedSuggestions}
        onApplyAllSuggestions={handleApplyAllSuggestions}
        onIgnoreSuggestion={handleIgnoreSuggestion}
        pendingCount={scopedPendingSuggestions.length}
        appliedCount={scopedAppliedSuggestionCount}
        applyingSuggestionId={applyingSuggestionId}
        ignoringSuggestionId={ignoringSuggestionId}
        isReviewingAll={isReviewingAll}
        isReviewingSelected={isReviewingSelected}
        activeSuggestionId={activeSuggestionId}
        onFocusSuggestion={focusSuggestionInEditor}
      />
    );

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 min-w-0 w-full max-w-[1600px] flex-col gap-3 xl:overflow-hidden">
        <div
          className="grid min-h-0 min-w-0 w-full gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-1 xl:overflow-hidden"
        >
          <div className="order-1 flex min-h-0 min-w-0 w-full flex-col gap-2 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
            <div className="relative z-20 flex min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
              <EditorTopBar
                title={title}
                onTitleChange={handleTitleChange}
                currentVersionNumber={versionNumber}
                documentId={document.id}
                versionRefreshKey={versionNumber}
                saveState={saveState}
                onSave={handleSave}
                onCreateVersion={handleCreateVersion}
                onRestoreVersion={handleRestoreVersion}
                isCreatingVersion={isCreatingVersion}
                editor={editor}
                indicators={<FidelityBadge status={fidelityStatus} />}
              />
              <EditorToolbar editor={editor} />
            </div>
            {formattingWarning ? (
              <div className="shrink-0">
                <div className="xl:hidden">
                  <InlineAlert title="Formatting may be limited" variant="warning">
                    {formattingWarning}
                  </InlineAlert>
                </div>
                <div
                  className="hidden items-center gap-2 rounded-lg bg-warning-muted px-3 py-1.5 text-xs text-warning-foreground xl:flex"
                  title={formattingWarning}
                >
                  <TriangleAlert className="size-3.5 shrink-0 text-warning" />
                  <span className="shrink-0 font-semibold">
                    Formatting may be limited
                  </span>
                  <span className="min-w-0 truncate">{formattingWarning}</span>
                </div>
              </div>
            ) : null}
            <EditorCanvas
              editor={editor}
              wordCount={counts.words}
              characterCount={counts.characters}
            />
            <EditorStatusBar
              fidelityStatus={fidelityStatus}
              text={currentEditorText}
              wordCount={counts.words}
              pendingSuggestionCount={scopedPendingSuggestions.length}
              appliedSuggestionCount={scopedAppliedSuggestionCount}
            />
          </div>

          <div className="order-2 hidden min-h-0 min-w-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
            {isDesktopAssistant ? assistantPanel : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-popover transition hover:bg-accent-dark md:bottom-5 xl:hidden"
          aria-haspopup="dialog"
          aria-expanded={assistantOpen}
          aria-label="Open AI assistant"
          title="Open AI assistant"
        >
          <Sparkles className="size-4" />
          {scopedPendingSuggestions.length > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-accent shadow-card-soft">
              {scopedPendingSuggestions.length}
            </span>
          ) : null}
        </button>

        <EditorAssistantSheet open={assistantOpen && !isDesktopAssistant} onClose={() => setAssistantOpen(false)}>
          {!isDesktopAssistant ? assistantPanel : null}
        </EditorAssistantSheet>

      </div>
    </main>
  );
}
