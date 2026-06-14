"use client";

import { useMemo, useState } from "react";
import { useEditor, type JSONContent } from "@tiptap/react";

import { editorExtensions } from "@/lib/editor/editor-extensions";

import { AIActionsPanel } from "@/components/ai/AIActionsPanel";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
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

type EditorWorkspaceProps = {
  document: EditorDocument;
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

const SUGGESTIONS: EditorSuggestion[] = [
  {
    id: "s1",
    index: 1,
    type: "Clarity",
    current:
      "increasing revenue through data-driven campaigns and strategic partnerships.",
    suggested:
      "driving revenue growth through data-driven campaigns and strategic partnerships.",
  },
  {
    id: "s2",
    index: 2,
    type: "Tone",
    current: "strengthen brand loyalty.",
    suggested: "build stronger brand loyalty.",
  },
  {
    id: "s3",
    index: 3,
    type: "Structure",
    note: "Consider adding a brief key takeaway at the end of this section to summarize the main objectives.",
  },
];

const FILTERS: SuggestionFilter[] = [
  { key: "all", label: "All", count: 6 },
  { key: "clarity", label: "Clarity", count: 2 },
  { key: "tone", label: "Tone", count: 2 },
  { key: "structure", label: "Structure", count: 1 },
  { key: "seo", label: "SEO", count: 1 },
];

const FORMATTING_WARNING: Record<string, string> = {
  "Limited Formatting":
    "Some original formatting could not be fully converted for editing. Your original file is preserved and can be exported.",
  "Formatting Review Needed":
    "This document may need a formatting review before export. Your original file is preserved.",
};

export function EditorWorkspace({ document }: EditorWorkspaceProps) {
  // editor_json is always stored as a TipTap document, but typed as the broad Json
  // union in the DB types, so we narrow it for the editor here.
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
  const [rightPanel, setRightPanel] = useState<RightPanelMode>("suggestions");
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [counts, setCounts] = useState({
    words: document.wordCount,
    characters: document.currentMarkdown.length,
  });
  // Bumped on selection changes so toolbar active states re-render on cursor moves.
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: editorExtensions,
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

      // The version endpoint also persists the current content, so the document
      // is now in sync. Reflect the new version number in the label.
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

    appToast.success("AI result is ready for review.");

    return {
      id: data.data.id,
      summary: data.data.result.summary,
      previewHref: `/documents/${document.id}/preview?requestId=${data.data.id}`,
    };
  };

  const fidelityStatus = document.fidelityStatus as FidelityStatus;
  const formattingWarning = FORMATTING_WARNING[document.fidelityStatus];

  return (
    <main className="flex-1 bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1280px] flex-col gap-3">
        <div className="grid gap-3 lg:grid-cols-[224px_minmax(0,1fr)] xl:min-h-0 xl:flex-1 xl:grid-rows-1 xl:grid-cols-[224px_minmax(0,1fr)_300px]">
          <div className="order-2 lg:order-1 xl:min-h-0">
            <EditorSidebar
              fileName={document.title}
              fileType={document.fileType}
              saveState={saveState}
              activeNav="editor"
              suggestionCount={6}
              versionCount={12}
              aiUsage={{
                used: 7200,
                total: 10000,
                resetLabel: "Reset in 18 days",
              }}
              user={{ name: "Alex Johnson", email: "alex@example.com" }}
            />
          </div>

          <div className="order-1 flex min-h-0 flex-col gap-2 lg:order-2">
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
                isCreatingVersion={isCreatingVersion}
                editor={editor}
                indicators={<FidelityBadge status={fidelityStatus} />}
              />
              <EditorToolbar editor={editor} />
            </div>
            {formattingWarning ? (
              <InlineAlert title="Formatting may be limited" variant="warning">
                {formattingWarning}
              </InlineAlert>
            ) : null}
            <EditorCanvas
              editor={editor}
              wordCount={counts.words}
              characterCount={counts.characters}
            />
          </div>

          <div className="order-3 lg:order-3 lg:col-span-2 xl:col-span-1 xl:min-h-0">
            {rightPanel === "ai-actions" ? (
              <AIActionsPanel
                onBack={() => setRightPanel("suggestions")}
                onClose={() => {
                  setRightPanel("suggestions");
                  setSuggestionsOpen(false);
                }}
                onRunAction={handleRunAIAction}
              />
            ) : (
              <EditorSuggestionsPanel
                open={suggestionsOpen}
                onClose={() => setSuggestionsOpen(false)}
                onReopen={() => setSuggestionsOpen(true)}
                onOpenAIActions={() => {
                  setSuggestionsOpen(true);
                  setRightPanel("ai-actions");
                }}
                suggestions={SUGGESTIONS}
                filters={FILTERS}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                totalCount={6}
              />
            )}
          </div>
        </div>

        <EditorStatusBar />
      </div>
    </main>
  );
}
