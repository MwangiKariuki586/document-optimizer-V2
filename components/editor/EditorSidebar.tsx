import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
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
  documentId: string;
  fileName: string;
  fileType: string;
  saveState: SaveState;
  activeNav: EditorNavKey;
  suggestionCount: number;
  versionCount: number;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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

export function EditorSidebar({
  documentId,
  fileName,
  fileType,
  saveState,
  activeNav,
  suggestionCount,
  versionCount,
  collapsed,
  onCollapsedChange,
  aiUsage,
  user,
}: EditorSidebarProps) {
  const saveLabel =
    saveState === "saved"
      ? "All changes saved"
      : saveState === "saving"
        ? "Saving changes…"
        : "Unsaved changes";
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
  const navHref: Record<EditorNavKey, string> = {
    editor: `/documents/${documentId}`,
    suggestions: `/documents/${documentId}`,
    versions: `/documents/${documentId}/versions`,
    export: `/documents/${documentId}/export`,
    info: `/documents/${documentId}`,
  };

  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const usageLabel = `${aiUsage.used.toLocaleString()} / ${aiUsage.total.toLocaleString()} tokens. ${aiUsage.resetLabel}`;

  return (
    <aside
      className={`flex h-full flex-col gap-4 ${
        collapsed ? "items-center lg:gap-3" : ""
      }`}
      aria-label={`${fileName} editor navigation`}
      title={`${fileName} (${fileType}) - ${saveLabel}`}
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary shadow-card-soft transition hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Expand editor sidebar"
            title="Expand sidebar"
          >
            <ChevronsRight className="size-4" />
          </button>
          <Link
            href="/dashboard"
            className="flex size-9 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Back to dashboard"
            title="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="inline-flex min-w-0 items-center gap-2 text-xs font-medium text-text-secondary transition hover:text-text-primary"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate">Back to dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Collapse editor sidebar"
            title="Collapse sidebar"
          >
            <ChevronsLeft className="size-4" />
          </button>
        </div>
      )}

      <nav className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
        {navItems.map((item) => {
          const isActive = item.key === activeNav;
          const Icon = item.icon;
          const itemClass = `${
            collapsed
              ? "relative flex size-9 items-center justify-center rounded-md"
              : "flex items-center gap-3 rounded-md px-3 py-2"
          } text-xs font-medium transition ${
            isActive
              ? "bg-accent-light text-accent"
              : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
          }`;
          const itemContent = (
            <>
              <Icon className="size-3.5 shrink-0" />
              {collapsed ? null : (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {typeof item.count === "number" && !collapsed ? (
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
              {typeof item.count === "number" && collapsed && item.count > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  {item.count > 9 ? "9+" : item.count}
                </span>
              ) : null}
            </>
          );

          return (
            <Link
              key={item.key}
              href={navHref[item.key]}
              aria-current={isActive ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={itemClass}
            >
              {itemContent}
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto flex flex-col ${
          collapsed ? "items-center gap-2" : "gap-4"
        }`}
      >
        {collapsed ? (
          <>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-accent shadow-card-soft transition hover:bg-surface-secondary"
              aria-label={`AI usage: ${usageLabel}`}
              title={`AI Usage: ${usageLabel}`}
            >
              <Sparkles className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-card-soft"
              aria-label={`Account: ${user.name}`}
              title={`${user.name} - ${user.email}`}
            >
              {initials}
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}
