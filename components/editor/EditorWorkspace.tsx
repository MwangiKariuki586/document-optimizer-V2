"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, type JSONContent } from "@tiptap/react";
import { TriangleAlert } from "lucide-react";

import { editorExtensions } from "@/lib/editor/editor-extensions";

import { AIActionsPanel } from "@/components/ai/AIActionsPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
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
import { countWords } from "@/lib/documents/text-to-editor";
import type { EditorDocument } from "@/lib/documents/document.types";
import type {
  AIActionKey,
  AIActionOptions,
  AIActionResult,
} from "@/lib/ai/ai.types";
import { mapDocumentSuggestionsToEditorSuggestions } from "@/lib/suggestions/suggestions.mapper";
import type { DocumentSuggestion } from "@/lib/suggestions/suggestions.types";
import {
  findSuggestionHighlightRanges,
  SuggestionHighlight,
  suggestionHighlightPluginKey,
} from "@/lib/editor/suggestion-highlight";

type EditorWorkspaceProps = {
  document: EditorDocument;
  initialSuggestions: DocumentSuggestion[];
};

export type SaveState = "saved" | "dirty" | "saving";

type RightPanelMode = "suggestions" | "ai-actions";

type RunAIActionResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    status: "completed";
    result: AIActionResult;
  };
};

type SuggestionsResponse = {
  success: boolean;
  error?: string;
  data?: DocumentSuggestion[];
};

type CreateSuggestionSelectionResponse = {
  success: boolean;
  error?: string;
  data?: {
    selectionId: string;
    expiresAt: string;
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

export function EditorWorkspace({
  document,
  initialSuggestions,
}: EditorWorkspaceProps) {
  const router = useRouter();
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [suggestions, setSuggestions] = useState<EditorSuggestion[]>(() =>
    mapDocumentSuggestionsToEditorSuggestions(initialSuggestions),
  );
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
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

  useEffect(() => {
    if (!editor) {
      return;
    }

    const pendingSuggestions = suggestions
      .filter((suggestion) => suggestion.status === "pending")
      .map((suggestion) => ({
        id: suggestion.id,
        originalText: suggestion.originalText,
      }));
    const ranges = findSuggestionHighlightRanges(
      editor.state.doc,
      pendingSuggestions,
    );

    editor.commands.setSuggestionHighlights(ranges);
  }, [editor, suggestions]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setActiveSuggestionHighlight(activeSuggestionId);
  }, [activeSuggestionId, editor]);

  const loadSuggestions = useCallback(async (): Promise<EditorSuggestion[]> => {
    setIsLoadingSuggestions(true);

    try {
      const response = await fetch(`/api/documents/${document.id}/suggestions`);
      const data: SuggestionsResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        appToast.error(data.error ?? "Could not load suggestions.");
        return [];
      }

      const mappedSuggestions = mapDocumentSuggestionsToEditorSuggestions(data.data);
      setSuggestions(mappedSuggestions);
      return mappedSuggestions;
    } catch {
      appToast.error("Could not load suggestions. Please try again.");
      return [];
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [document.id]);

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

    const nextSuggestions = await loadSuggestions();
    const nextPendingSuggestions = nextSuggestions.filter(
      (suggestion) => suggestion.status === "pending",
    );

    if (nextPendingSuggestions.length > 0) {
      setRightPanel("suggestions");
      setSuggestionsOpen(true);
    } else {
      setRightPanel("ai-actions");
    }

    appToast.success("AI result is ready for review.");

    return {
      id: data.data.id,
      summary: data.data.result.summary,
      previewHref: `/documents/${document.id}/preview?requestId=${data.data.id}`,
    };
  };

  const filters = useMemo<SuggestionFilter[]>(() => {
    const typeCounts = suggestions.reduce<Record<string, number>>(
      (countsByType, suggestion) => {
        const key = suggestion.type.toLowerCase();
        countsByType[key] = (countsByType[key] ?? 0) + 1;
        return countsByType;
      },
      {},
    );

    return [
      { key: "all", label: "All", count: suggestions.length },
      { key: "clarity", label: "Clarity", count: typeCounts.clarity ?? 0 },
      { key: "grammar", label: "Grammar", count: typeCounts.grammar ?? 0 },
      { key: "tone", label: "Tone", count: typeCounts.tone ?? 0 },
      { key: "structure", label: "Structure", count: typeCounts.structure ?? 0 },
      { key: "seo", label: "SEO", count: typeCounts.seo ?? 0 },
    ];
  }, [suggestions]);

  const filteredSuggestions = useMemo(
    () =>
      activeFilter === "all"
        ? suggestions
        : suggestions.filter(
            (suggestion) => suggestion.type.toLowerCase() === activeFilter,
          ),
    [activeFilter, suggestions],
  );

  const pendingSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === "pending",
  ).length;
  const appliedSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === "applied",
  ).length;
  const hasSuggestions = suggestions.length > 0;

  const handleApplySuggestion = async (id: string) => {
    if (!editor) {
      appToast.error("The editor is still loading. Please try again.");
      return;
    }

    setApplyingSuggestionId(id);

    try {
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
        appToast.error(data.error ?? "Could not apply suggestion.");
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
          suggestion.id === id
            ? { ...suggestion, status: "applied" }
            : suggestion,
        ),
      );
      appToast.success("Suggestion applied. A version snapshot was created first.");
    } catch {
      appToast.error("Could not apply suggestion. Please try again.");
    } finally {
      setApplyingSuggestionId(null);
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

    try {
      const response = await fetch(
        `/api/documents/${document.id}/suggestions/${id}/ignore`,
        { method: "POST" },
      );
      const data: IgnoreSuggestionResponse = await response.json();

      if (!response.ok || !data.success) {
        appToast.error(data.error ?? "Could not ignore suggestion.");
        return;
      }

      setActiveSuggestionId((current) => (current === id ? null : current));
      setSuggestions((current) =>
        current.map((suggestion) =>
          suggestion.id === id
            ? { ...suggestion, status: "ignored" }
            : suggestion,
        ),
      );
      appToast.info("Suggestion ignored.");
    } catch {
      appToast.error("Could not ignore suggestion. Please try again.");
    } finally {
      setIgnoringSuggestionId(null);
    }
  };

  const openSelectionPreview = async (suggestionIds: string[]) => {
    const response = await fetch(
      `/api/documents/${document.id}/suggestions/selections`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionIds }),
      },
    );
    const data: CreateSuggestionSelectionResponse = await response.json();

    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error ?? "Could not open suggestion review.");
    }

    router.push(
      `/documents/${document.id}/preview?selectionId=${data.data.selectionId}`,
    );
  };

  const handleReviewAppliedSuggestions = () => {
    if (appliedSuggestionCount === 0) {
      return;
    }

    setIsReviewingSelected(true);
    router.push(`/documents/${document.id}/preview?applied=1`);
  };

  const handleReviewAllSuggestions = async () => {
    const pendingIds = suggestions
      .filter((suggestion) => suggestion.status === "pending")
      .map((suggestion) => suggestion.id);

    if (pendingIds.length === 0) {
      return;
    }

    setIsReviewingAll(true);

    try {
      await openSelectionPreview(pendingIds);
    } catch {
      appToast.error("Could not open suggestions for review.");
    } finally {
      setIsReviewingAll(false);
    }
  };

  const fidelityStatus = document.fidelityStatus as FidelityStatus;
  const formattingWarning = FORMATTING_WARNING[document.fidelityStatus];

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-3 xl:overflow-hidden">
        <div
          className="grid min-h-0 gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-1 xl:overflow-hidden"
        >
          <div className="order-1 flex min-h-0 flex-col gap-2 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
            <div className="relative z-20 flex shrink-0 flex-col rounded-xl border border-border bg-surface shadow-card-soft">
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
            <EditorStatusBar fidelityStatus={fidelityStatus} />
          </div>

          <div className="order-2 min-h-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
            {rightPanel === "ai-actions" ? (
              <AIActionsPanel
                onBack={hasSuggestions ? () => setRightPanel("suggestions") : undefined}
                onClose={
                  hasSuggestions
                    ? () => {
                        setRightPanel("suggestions");
                        setSuggestionsOpen(false);
                      }
                    : undefined
                }
                onRunAction={handleRunAIAction}
              />
            ) : (
              <EditorSuggestionsPanel
                open={suggestionsOpen}
                onClose={() => setSuggestionsOpen(false)}
                onReopen={() => setSuggestionsOpen(true)}
                onOpenAIActions={() => setRightPanel("ai-actions")}
                suggestions={filteredSuggestions}
                filters={filters}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onApplySuggestion={handleApplySuggestion}
                onReviewAppliedSuggestions={handleReviewAppliedSuggestions}
                onReviewAllSuggestions={handleReviewAllSuggestions}
                onIgnoreSuggestion={handleIgnoreSuggestion}
                pendingCount={pendingSuggestionCount}
                appliedCount={appliedSuggestionCount}
                isLoading={isLoadingSuggestions}
                applyingSuggestionId={applyingSuggestionId}
                ignoringSuggestionId={ignoringSuggestionId}
                isReviewingAll={isReviewingAll}
                isReviewingSelected={isReviewingSelected}
                activeSuggestionId={activeSuggestionId}
                onFocusSuggestion={focusSuggestionInEditor}
              />
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
