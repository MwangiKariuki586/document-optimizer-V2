"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, History, PanelRightOpen } from "lucide-react";

import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RestoreVersionDialog } from "@/components/versions/RestoreVersionDialog";
import { VersionComparisonWorkspace } from "@/components/versions/VersionComparisonWorkspace";
import { VersionDetailsPanel } from "@/components/versions/VersionDetailsPanel";
import { VersionTimeline } from "@/components/versions/VersionTimeline";
import { appToast } from "@/lib/feedback/toast";
import type { EditorDocument } from "@/lib/documents/document.types";
import {
  filterVersions,
  getVersionChangeSummary,
  versionTabs,
  type VersionTab,
} from "@/lib/versions/version-history.utils";
import type { VersionListItem } from "@/lib/versions/versions.service";

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

export function VersionHistoryWorkspace({
  document,
  versions,
}: VersionHistoryWorkspaceProps) {
  const router = useRouter();
  const comparisonRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<VersionTab>("all");
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(
    versions[0]?.versionNumber ?? document.versionNumber,
  );
  const [restoreCandidate, setRestoreCandidate] =
    useState<VersionListItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  const currentPreview = {
    versionNumber: document.versionNumber,
    title: document.title,
    source: "current" as const,
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

  const selectedPreview = selectedVersion
    ? {
        versionNumber: selectedVersion.versionNumber,
        title: selectedVersion.title,
        source: selectedVersion.source,
        createdAt: selectedVersion.createdAt,
        notes: selectedVersion.notes,
        contentMarkdown: selectedVersion.contentMarkdown,
      }
    : currentPreview;

  const isCurrentSelected =
    selectedPreview.versionNumber === currentPreview.versionNumber;
  const canRestore = Boolean(selectedVersion) && !isCurrentSelected;
  const showDetailsPanel = isXl && detailsOpen;
  const changeSummary = getVersionChangeSummary(
    selectedPreview.contentMarkdown,
    currentPreview.contentMarkdown,
  );

  const handleTabChange = (tab: VersionTab) => {
    setActiveTab(tab);
    const nextVersions = filterVersions(tab, versions);

    if (nextVersions.length > 0) {
      setSelectedVersionNumber(nextVersions[0].versionNumber);
    }
  };

  const openRestoreDialog = () => {
    if (selectedVersion) {
      setRestoreCandidate(selectedVersion);
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
        `Restored version v${data.data.selectedVersionNumber}. Your previous state was saved first.`,
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

  const scrollToComparison = () => {
    comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openDetails = () => {
    if (isLg) {
      setDetailsOpen(true);
      return;
    }

    setDetailsDrawerOpen(true);
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-[calc(100vh-73px)] xl:max-h-[calc(100vh-73px)] xl:overflow-hidden">
      <div
        className={`mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden ${
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

        <div className="order-1 flex min-h-0 flex-col gap-3 overflow-hidden lg:order-2 xl:h-full">
          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card-soft">
            <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
                  <History className="size-4" />
                </span>
                <h1 className="truncate text-[22px] font-bold leading-7 text-text-primary md:text-[24px] md:leading-8">
                  Version History
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!showDetailsPanel && isLg ? (
                  <button
                    type="button"
                    onClick={openDetails}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
                  >
                    <PanelRightOpen className="size-4 text-accent" />
                    Version details
                  </button>
                ) : null}
                {!isLg ? (
                  <button
                    type="button"
                    onClick={() => setDetailsDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
                  >
                    <PanelRightOpen className="size-4 text-accent" />
                    Version details
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={scrollToComparison}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
                >
                  <ArrowLeftRight className="size-4 text-accent" />
                  Compare Versions
                </button>
              </div>
            </header>

            <div className="flex shrink-0 flex-wrap items-center gap-1 border-t border-border-light pt-1">
              {versionTabs.map((tab) => {
                const isActive = tab.key === activeTab;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`border-b-2 px-3 py-1.5 text-sm font-medium transition ${
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
          </div>

          {filteredVersions.length === 0 ? (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-card-soft">
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
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
              <div
                className={`grid min-h-0 flex-1 gap-3 overflow-hidden ${
                  showDetailsPanel
                    ? "xl:grid-cols-[240px_minmax(0,1fr)_288px]"
                    : "lg:grid-cols-[240px_minmax(0,1fr)]"
                }`}
              >
                <div ref={timelineRef} className="min-h-0 shrink-0">
                  <VersionTimeline
                    versions={filteredVersions}
                    selectedVersionNumber={selectedPreview.versionNumber}
                    currentVersionNumber={currentPreview.versionNumber}
                    onSelect={setSelectedVersionNumber}
                  />
                </div>

                <VersionComparisonWorkspace
                  comparisonRef={comparisonRef}
                  selectedPreview={selectedPreview}
                  currentPreview={currentPreview}
                  versions={filteredVersions}
                  currentVersionNumber={currentPreview.versionNumber}
                  changeSummary={changeSummary}
                  onSelectedVersionChange={setSelectedVersionNumber}
                  onRestore={openRestoreDialog}
                  canRestore={canRestore}
                />

                {showDetailsPanel ? (
                  <VersionDetailsPanel
                    selectedPreview={selectedPreview}
                    isCurrentSelected={isCurrentSelected}
                    changeSummary={changeSummary}
                    onRestore={openRestoreDialog}
                    canRestore={canRestore}
                    onClose={() => setDetailsOpen(false)}
                  />
                ) : null}
              </div>

            </div>
          )}
        </div>
      </div>

      {detailsDrawerOpen && !isLg ? (
        <VersionDetailsPanel
          variant="drawer"
          selectedPreview={selectedPreview}
          isCurrentSelected={isCurrentSelected}
          changeSummary={changeSummary}
          onRestore={openRestoreDialog}
          canRestore={canRestore}
          onClose={() => setDetailsDrawerOpen(false)}
        />
      ) : null}

      {restoreCandidate ? (
        <RestoreVersionDialog
          version={restoreCandidate}
          isRestoring={isRestoring}
          onCancel={() => setRestoreCandidate(null)}
          onConfirm={handleRestore}
        />
      ) : null}
    </main>
  );
}
