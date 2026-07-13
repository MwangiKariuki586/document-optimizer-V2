"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Check,
  ChevronDown,
  GitBranch,
  PencilLine,
  Redo2,
  Save,
  Undo2,
} from "lucide-react";

import { CometSpinner } from "@/components/loading-ui/CometSpinner";
import { EditorMenuBackdrop } from "@/components/editor/EditorMenuBackdrop";
import { EditorMenuItem } from "@/components/editor/EditorMenuItem";
import { EditorMenuPanel } from "@/components/editor/EditorMenuPanel";
import { VersionMenu } from "@/components/editor/VersionMenu";
import type { SaveState } from "@/components/editor/EditorWorkspace";

type EditorTopBarProps = {
  title: string;
  onTitleChange: (value: string) => void;
  currentVersionNumber: number;
  documentId: string;
  versionRefreshKey: number;
  saveState: SaveState;
  onSave: () => void;
  onCreateVersion: () => void;
  onRestoreVersion: (versionNumber: number) => Promise<void>;
  isCreatingVersion: boolean;
  editor: Editor | null;
  indicators?: React.ReactNode;
};

type OpenMenu = "save" | "version" | null;

const iconButtonClass =
  "flex size-8 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40";

const savePrimaryClass =
  "inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-accent bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70";

const saveCaretClass =
  "inline-flex items-center justify-center rounded-r-md border border-accent bg-accent px-1.5 py-1.5 text-accent-foreground transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70";

const saveSavedClass =
  "inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-border bg-surface px-3 py-1.5 text-xs font-medium text-success-foreground transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70";

const saveCaretSavedClass =
  "inline-flex items-center justify-center rounded-r-md border border-border bg-surface px-1.5 py-1.5 text-text-secondary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70";

export function EditorTopBar({
  title,
  onTitleChange,
  currentVersionNumber,
  documentId,
  versionRefreshKey,
  saveState,
  onSave,
  onCreateVersion,
  onRestoreVersion,
  isCreatingVersion,
  editor,
  indicators,
}: EditorTopBarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const saveMenuOpen = openMenu === "save";
  const versionMenuOpen = openMenu === "version";

  useEffect(() => {
    if (!saveMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveMenuOpen]);

  const handleSave = () => {
    setOpenMenu(null);
    onSave();
  };

  const handleSaveVersion = () => {
    setOpenMenu(null);
    onCreateVersion();
  };

  const isSaving = saveState === "saving";
  const isSaved = saveState === "saved";
  const isDirty = saveState === "dirty";

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 px-3 py-2 sm:px-4 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <label htmlFor="editor-title" className="sr-only">
          Document title
        </label>
        <input
          id="editor-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 text-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-accent"
        />
        <PencilLine className="size-4 shrink-0 text-text-muted" />
      </div>

      {indicators ? (
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {indicators}
        </div>
      ) : null}

      <div className="scrollbar-hidden flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-0.5 xl:w-auto xl:shrink-0 xl:overflow-visible xl:pb-0">
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={isSaved ? saveSavedClass : savePrimaryClass}
          >
            {isSaving ? (
              <>
                <CometSpinner className="size-3.5" />
                Saving
              </>
            ) : isSaved ? (
              <>
                <Check className="size-3.5" />
                Saved
              </>
            ) : (
              <>
                {isDirty ? (
                  <span className="size-1.5 shrink-0 rounded-full bg-accent-foreground" />
                ) : null}
                Save
              </>
            )}
          </button>

          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={saveMenuOpen}
            onClick={() =>
              setOpenMenu((current) => (current === "save" ? null : "save"))
            }
            disabled={isSaving}
            className={isSaved ? saveCaretSavedClass : saveCaretClass}
          >
            <ChevronDown
              className={`size-3.5 transition-transform ${saveMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {saveMenuOpen ? (
            <>
              <EditorMenuBackdrop onClose={() => setOpenMenu(null)} />
              <EditorMenuPanel className="w-56">
                <EditorMenuItem
                  label="Save"
                  description="Update the working copy"
                  icon={<Save className="size-4" />}
                  onClick={handleSave}
                  disabled={isSaving}
                />
                <EditorMenuItem
                  label="Save version"
                  description="Create a recoverable snapshot"
                  icon={
                    isCreatingVersion ? (
                      <CometSpinner className="size-4" />
                    ) : (
                      <GitBranch className="size-4" />
                    )
                  }
                  onClick={handleSaveVersion}
                  disabled={isCreatingVersion}
                />
              </EditorMenuPanel>
            </>
          ) : null}
        </div>

        <span className="mx-1 hidden h-5 w-px bg-border md:block" />

        <VersionMenu
          currentVersionNumber={currentVersionNumber}
          documentId={documentId}
          refreshKey={versionRefreshKey}
          open={versionMenuOpen}
          onOpenChange={(open) => setOpenMenu(open ? "version" : null)}
          onRestoreVersion={onRestoreVersion}
        />

        <button
          type="button"
          className={iconButtonClass}
          title="Undo"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          className={iconButtonClass}
          title="Redo"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
