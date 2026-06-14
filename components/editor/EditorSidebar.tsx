import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileText,
  History,
  Info,
  PencilLine,
  Sparkles,
} from "lucide-react";

import type { SaveState } from "@/components/editor/EditorWorkspace";

export type EditorNavKey =
  | "editor"
  | "suggestions"
  | "versions"
  | "export"
  | "info";

type NavItem = {
  key: EditorNavKey;
  label: string;
  icon: typeof FileText;
  count?: number;
};

type EditorSidebarProps = {
  fileName: string;
  fileType: string;
  saveState: SaveState;
  activeNav: EditorNavKey;
  suggestionCount: number;
  versionCount: number;
  aiUsage: {
    used: number;
    total: number;
    resetLabel: string;
  };
  user: {
    name: string;
    email: string;
  };
};

const FILE_TYPE_LETTER: Record<string, string> = {
  pdf: "P",
  docx: "W",
  markdown: "M",
  txt: "T",
};

export function EditorSidebar({
  fileName,
  fileType,
  saveState,
  activeNav,
  suggestionCount,
  versionCount,
  aiUsage,
  user,
}: EditorSidebarProps) {
  const fileLetter = FILE_TYPE_LETTER[fileType];
  const saveLabel =
    saveState === "saved"
      ? "All changes saved"
      : saveState === "saving"
        ? "Saving changes…"
        : "Unsaved changes";
  const savedSubtitle =
    saveState === "saving"
      ? "Saving…"
      : saveState === "dirty"
        ? "Unsaved changes"
        : "Saved just now";
  const navItems: NavItem[] = [
    { key: "editor", label: "Editor", icon: PencilLine },
    {
      key: "suggestions",
      label: "AI Suggestions",
      icon: Sparkles,
      count: suggestionCount,
    },
    { key: "versions", label: "Versions", icon: History, count: versionCount },
    { key: "export", label: "Export", icon: Download },
    { key: "info", label: "Document Info", icon: Info },
  ];

  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex h-full flex-col gap-4">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition hover:text-text-primary"
      >
        <ArrowLeft className="size-3.5" />
        Back to Documents
      </Link>

      <div className="rounded-xl border border-border bg-surface p-3 shadow-card-soft">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-info-light bg-info-muted text-sm font-bold text-info">
            {fileLetter ?? <FileText className="size-5" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-text-primary">
              {fileName}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{savedSubtitle}</p>
          </div>
        </div>
        <span
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            saveState === "saved"
              ? "bg-success-muted text-success-foreground"
              : "bg-surface-tertiary text-text-secondary"
          }`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {saveLabel}
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.key === activeNav;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {typeof item.count === "number" ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface-tertiary text-text-muted"
                  }`}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-surface p-3 shadow-card-soft">
          <p className="text-xs font-semibold text-text-primary">
            AI Usage{" "}
            <span className="font-normal text-text-muted">(This month)</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-text-primary">
            {aiUsage.used.toLocaleString()}
            <span className="font-normal text-text-muted">
              {" "}
              / {aiUsage.total.toLocaleString()} tokens
            </span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-tertiary">
            <div className="h-full w-[72%] rounded-full bg-accent" />
          </div>
          <p className="mt-2 text-xs text-text-muted">{aiUsage.resetLabel}</p>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left shadow-card-soft transition hover:bg-surface-secondary"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text-primary">
              {user.name}
            </span>
            <span className="block truncate text-xs text-text-muted">
              {user.email}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-text-muted" />
        </button>
      </div>
    </aside>
  );
}
