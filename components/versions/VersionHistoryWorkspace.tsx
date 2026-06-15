"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  CheckCircle2,
  History,
  MoreVertical,
  RotateCcw,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { LoadingButton } from "@/components/feedback/LoadingButton";
import { appToast } from "@/lib/feedback/toast";
import type { EditorDocument } from "@/lib/documents/document.types";
import type { VersionListItem, VersionSource } from "@/lib/versions/versions.service";

type VersionTab = "all" | "ai" | "manual" | "exports";

type VersionHistoryWorkspaceProps = {
  document: EditorDocument;
  versions: VersionListItem[];
};

type RestoreVersionResponse = {
  success: boolean;
  error?: string;
  data?: {
    documentId: string;
    selectedVersionNumber: number;
    restoredVersionNumber: number;
  };
};

type PreviewRecord = {
  versionNumber: number;
  title: string;
  source: VersionSource | "current";
  createdAt: string;
  notes: string | null;
  contentMarkdown: string;
};

const tabs: { key: VersionTab; label: string }[] = [
  { key: "all", label: "All Versions" },
  { key: "ai", label: "AI Versions" },
  { key: "manual", label: "Manual Versions" },
  { key: "exports", label: "Exports" },
];

const sourceLabel: Record<VersionSource | "current", string> = {
  upload: "Original Upload",
  paste: "Pasted Text",
  blank: "Blank Document",
  manual_save: "Manual Save",
  ai_apply: "AI Applied",
  suggestion_apply: "Suggestion Applied",
  restore: "Restored",
  current: "Current Working Copy",
};

function filterVersions(tab: VersionTab, versions: VersionListItem[]) {
  if (tab === "ai") {
    return versions.filter(
      (version) =>
        version.source === "ai_apply" || version.source === "suggestion_apply",
    );
  }

  if (tab === "manual") {
    return versions.filter(
      (version) =>
        version.source === "manual_save" ||
        version.source === "upload" ||
        version.source === "paste" ||
        version.source === "blank" ||
        version.source === "restore",
    );
  }

  if (tab === "exports") {
    return [];
  }

  return versions;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function splitWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getChangeSummary(selectedMarkdown: string, currentMarkdown: string) {
  const selectedWords = splitWords(selectedMarkdown);
  const currentWords = splitWords(currentMarkdown);
  const selectedSet = new Set(selectedWords.map((word) => word.toLowerCase()));
  const currentSet = new Set(currentWords.map((word) => word.toLowerCase()));
  const additions = currentWords.filter(
    (word) => !selectedSet.has(word.toLowerCase()),
  ).length;
  const deletions = selectedWords.filter(
    (word) => !currentSet.has(word.toLowerCase()),
  ).length;

  return {
    additions,
    deletions,
    modifications: Math.min(additions, deletions),
  };
}

function VersionSourceIcon({ source }: { source: VersionSource | "current" }) {
  if (
    source === "manual_save" ||
    source === "upload" ||
    source === "paste" ||
    source === "blank"
  ) {
    return <UserRound className="size-3.5" />;
  }

  return <Sparkles className="size-3.5" />;
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");

  if (markdown.trim().length === 0) {
    return (
      <p className="rounded-lg border border-border-light bg-surface-secondary p-4 text-sm text-text-muted">
        No saved content in this version.
      </p>
    );
  }

  return (
    <article className="document-editor mx-auto max-w-[640px] text-sm leading-6 text-text-primary">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed.length === 0) {
          return <br key={`blank-${index}`} />;
        }

        if (trimmed.startsWith("### ")) {
          return <h3 key={index}>{trimmed.slice(4)}</h3>;
        }

        if (trimmed.startsWith("## ")) {
          return <h2 key={index}>{trimmed.slice(3)}</h2>;
        }

        if (trimmed.startsWith("# ")) {
          return <h1 key={index}>{trimmed.slice(2)}</h1>;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <ul key={index}>
              <li>{trimmed.slice(2)}</li>
            </ul>
          );
        }

        return <p key={index}>{trimmed}</p>;
      })}
    </article>
  );
}

function VersionDocumentPreview({
  label,
  version,
  currentVersionNumber,
}: {
  label: string;
  version: PreviewRecord;
  currentVersionNumber: number;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            {label}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="rounded-md bg-accent-light px-2 py-1 text-xs font-semibold text-accent">
              v{version.versionNumber}
            </span>
            <p className="truncate text-sm font-semibold text-text-primary">
              {version.source === "current" ? "Current" : version.title}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-xs text-text-muted">
          {version.versionNumber === currentVersionNumber
            ? "Current"
            : formatDate(version.createdAt)}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <MarkdownPreview markdown={version.contentMarkdown} />
      </div>
    </section>
  );
}

export function VersionHistoryWorkspace({
  document,
  versions,
}: VersionHistoryWorkspaceProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<VersionTab>("all");
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(
    versions[0]?.versionNumber ?? document.versionNumber,
  );
  const [restoreCandidate, setRestoreCandidate] =
    useState<VersionListItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const currentVersion: PreviewRecord = {
    versionNumber: document.versionNumber,
    title: document.title,
    source: "current",
    createdAt: document.updatedAt,
    notes: "Current live document state.",
    contentMarkdown: document.currentMarkdown,
  };

  const filteredVersions = useMemo(
    () => filterVersions(activeTab, versions),
    [activeTab, versions],
  );
  const selectedVersion =
    filteredVersions.find(
      (version) => version.versionNumber === selectedVersionNumber,
    ) ??
    filteredVersions[0] ??
    null;
  const selectedPreview: PreviewRecord = selectedVersion
    ? {
        versionNumber: selectedVersion.versionNumber,
        title: selectedVersion.title,
        source: selectedVersion.source,
        createdAt: selectedVersion.createdAt,
        notes: selectedVersion.notes,
        contentMarkdown: selectedVersion.contentMarkdown,
      }
    : currentVersion;
  const isCurrentSelected =
    selectedPreview.versionNumber === currentVersion.versionNumber;
  const summary = getChangeSummary(
    selectedPreview.contentMarkdown,
    currentVersion.contentMarkdown,
  );

  const handleTabChange = (tab: VersionTab) => {
    setActiveTab(tab);
    const nextVersions = filterVersions(tab, versions);

    if (nextVersions.length > 0) {
      setSelectedVersionNumber(nextVersions[0].versionNumber);
    }
  };

  const handleRestore = async () => {
    if (!restoreCandidate || isRestoring) {
      return;
    }

    setIsRestoring(true);

    try {
      const response = await fetch(
        `/api/documents/${document.id}/versions/${restoreCandidate.versionNumber}/restore`,
        { method: "POST" },
      );
      const data: RestoreVersionResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        appToast.error(data.error ?? "Could not restore this version.");
        return;
      }

      appToast.success(
        `Restored version v${data.data.selectedVersionNumber}.`,
      );
      setRestoreCandidate(null);
      router.push(`/documents/${document.id}`);
      router.refresh();
    } catch {
      appToast.error("Could not restore this version. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:max-h-[calc(100vh-73px)] xl:overflow-hidden">
      <div
        className={`mx-auto grid h-full min-h-0 w-full max-w-[1480px] gap-3 xl:grid-rows-1 xl:overflow-hidden ${
          sidebarCollapsed
            ? "lg:grid-cols-[64px_minmax(0,1fr)]"
            : "lg:grid-cols-[224px_minmax(0,1fr)]"
        }`}
      >
        <div className="order-2 min-h-0 lg:order-1 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden">
          <EditorSidebar
            documentId={document.id}
            fileName={document.title}
            fileType={document.fileType}
            saveState="saved"
            activeNav="versions"
            suggestionCount={0}
            versionCount={versions.length}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            aiUsage={{
              used: 7200,
              total: 10000,
              resetLabel: "Reset in 18 days",
            }}
            user={{ name: "Alex Johnson", email: "alex@example.com" }}
          />
        </div>

        <div className="order-1 flex min-h-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-card-soft lg:order-2 xl:h-full">
          <header className="flex shrink-0 flex-col gap-3 border-b border-border-light pb-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <History className="size-3.5" />
                <span>Document versions</span>
              </div>
              <h1 className="mt-2 text-[28px] font-bold leading-9 text-text-primary md:text-[32px] md:leading-10">
                Version History
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Track changes and restore previous document states.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
            >
              <ArrowLeftRight className="size-4 text-accent" />
              Compare Versions
            </button>
          </header>

          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border-light">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {filteredVersions.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <EmptyState
                title={
                  activeTab === "exports"
                    ? "No export versions yet"
                    : "No versions saved yet"
                }
                description={
                  activeTab === "exports"
                    ? "Generated exports will appear here after the export flow is built."
                    : "Save a manual version or apply a document change to create recoverable history."
                }
                action={
                  <Link
                    href={`/documents/${document.id}`}
                    className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
                  >
                    Back to editor
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[270px_minmax(0,1fr)_300px] xl:overflow-hidden">
              <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
                <div className="shrink-0 border-b border-border-light px-4 py-3">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Version Timeline
                  </h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {filteredVersions.length} saved document states
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredVersions.map((version, index) => {
                    const isSelected =
                      version.versionNumber === selectedPreview.versionNumber;
                    const isCurrent =
                      version.versionNumber === currentVersion.versionNumber;

                    return (
                      <button
                        key={version.id}
                        type="button"
                        onClick={() =>
                          setSelectedVersionNumber(version.versionNumber)
                        }
                        className={`grid w-full grid-cols-[34px_minmax(0,1fr)_24px] gap-3 border-b border-border-light px-4 py-4 text-left transition hover:bg-surface-secondary ${
                          isSelected ? "bg-accent-muted" : "bg-surface"
                        }`}
                      >
                        <span className="relative flex justify-center">
                          {index < filteredVersions.length - 1 ? (
                            <span className="absolute top-8 h-full w-px bg-border" />
                          ) : null}
                          <span
                            className={`relative z-10 flex size-8 items-center justify-center rounded-lg text-xs font-semibold ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-surface-tertiary text-text-secondary"
                            }`}
                          >
                            v{version.versionNumber}
                          </span>
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-text-primary">
                              {sourceLabel[version.source]}
                            </span>
                            {isCurrent ? (
                              <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent">
                                Current
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-xs text-text-muted">
                            {formatDate(version.createdAt)}
                          </span>
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                            <VersionSourceIcon source={version.source} />
                            by{" "}
                            {version.source === "manual_save" ||
                            version.source === "upload" ||
                            version.source === "paste" ||
                            version.source === "blank"
                              ? "You"
                              : "Document Optimizer"}
                          </span>
                        </span>
                        <MoreVertical className="mt-1 size-4 text-text-muted" />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex min-h-0 flex-col gap-3 overflow-hidden">
                <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-3">
                  <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card-soft">
                    <p className="text-xs font-semibold text-text-primary">
                      v{selectedPreview.versionNumber}
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {selectedVersion
                        ? formatDate(selectedVersion.createdAt)
                        : "No saved version"}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-accent shadow-card-soft">
                    <ArrowLeftRight className="size-4" />
                  </div>
                  <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card-soft">
                    <p className="text-xs font-semibold text-text-primary">
                      v{currentVersion.versionNumber} Current
                    </p>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      {formatDate(currentVersion.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 xl:overflow-hidden">
                  <VersionDocumentPreview
                    label="Selected version"
                    version={selectedPreview}
                    currentVersionNumber={currentVersion.versionNumber}
                  />
                  <VersionDocumentPreview
                    label="Current version"
                    version={currentVersion}
                    currentVersionNumber={currentVersion.versionNumber}
                  />
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2.5 rounded-sm bg-success" />
                      Added
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2.5 rounded-sm bg-error" />
                      Removed
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2.5 rounded-sm bg-info" />
                      Modified
                    </span>
                  </div>
                  <span className="text-xs font-medium text-text-secondary">
                    100%
                  </span>
                </div>
              </section>

              <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
                <div className="shrink-0 border-b border-border-light px-4 py-3">
                  <h2 className="text-sm font-semibold text-text-primary">
                    Version Details
                  </h2>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-semibold text-accent">
                      v{selectedPreview.versionNumber}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {sourceLabel[selectedPreview.source]}
                        </h3>
                        {isCurrentSelected ? (
                          <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                            Current Version
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDate(selectedPreview.createdAt)}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                        <VersionSourceIcon source={selectedPreview.source} />
                        by{" "}
                        {selectedPreview.source === "manual_save" ||
                        selectedPreview.source === "upload" ||
                        selectedPreview.source === "paste" ||
                        selectedPreview.source === "blank"
                          ? "You"
                          : "Document Optimizer"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                      Notes
                    </h3>
                    <p className="mt-2 rounded-lg border border-border-light bg-surface-secondary p-3 text-sm text-text-secondary">
                      {selectedPreview.notes ?? "No notes saved for this version."}
                    </p>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                      Change Summary
                    </h3>
                    <div className="mt-3 space-y-2">
                      {[
                        {
                          label: "additions",
                          value: summary.additions,
                          icon: "+",
                          className: "bg-success-muted text-success-foreground",
                          description: "Words present in current document",
                        },
                        {
                          label: "deletions",
                          value: summary.deletions,
                          icon: "-",
                          className: "bg-error-muted text-error-foreground",
                          description: "Words only in selected version",
                        },
                        {
                          label: "modifications",
                          value: summary.modifications,
                          icon: "!",
                          className: "bg-info-muted text-info-foreground",
                          description: "Estimated changed wording",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-lg border border-border-light bg-surface px-3 py-2"
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${item.className}`}
                          >
                            {item.icon}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-text-primary">
                              {item.value} {item.label}
                            </span>
                            <span className="block text-xs text-text-muted">
                              {item.description}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                      Version Safety
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {[
                        "Restore is scoped to this signed-in document.",
                        "Current content is saved before restore.",
                        "Structured editor content is restored when available.",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="shrink-0 border-t border-border-light p-4">
                  <button
                    type="button"
                    onClick={() =>
                      selectedVersion ? setRestoreCandidate(selectedVersion) : null
                    }
                    disabled={isCurrentSelected || !selectedVersion}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted disabled:hover:bg-transparent"
                  >
                    <RotateCcw className="size-4" />
                    Restore this version
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {restoreCandidate ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-version-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-muted px-4"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-popover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="restore-version-title"
                  className="text-lg font-semibold text-text-primary"
                >
                  Restore v{restoreCandidate.versionNumber}?
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  The current editor content will be replaced with this saved
                  version without creating a new version.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                className="rounded-md p-1 text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
                aria-label="Close restore confirmation"
                disabled={isRestoring}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 rounded-lg border border-border-light bg-surface-secondary p-3 text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">
                {sourceLabel[restoreCandidate.source]}
              </span>{" "}
              from {formatDate(restoreCandidate.createdAt)}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                disabled={isRestoring}
                className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <LoadingButton
                type="button"
                isLoading={isRestoring}
                loadingText="Restoring"
                onClick={handleRestore}
              >
                Restore version
              </LoadingButton>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
