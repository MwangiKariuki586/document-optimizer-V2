import type { DocumentsLibraryTabCounts } from "@/lib/documents/documents-library.service";

const TABS = [
  { id: "all", label: "All Documents" },
  { id: "needs-review", label: "Needs Review" },
  { id: "suggestions-ready", label: "Suggestions Ready" },
  { id: "ready-to-export", label: "Ready to Export" },
  { id: "archived", label: "Archived" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type DocumentsTabsProps = {
  activeTab: string;
  counts: DocumentsLibraryTabCounts;
  onTabChange: (tab: TabId) => void;
};

function tabCount(counts: DocumentsLibraryTabCounts, id: TabId): number {
  switch (id) {
    case "all":
      return counts.all;
    case "needs-review":
      return counts.needsReview;
    case "suggestions-ready":
      return counts.suggestionsReady;
    case "ready-to-export":
      return counts.readyToExport;
    case "archived":
      return counts.archived;
  }
}

export function DocumentsTabs({
  activeTab,
  counts,
  onTabChange,
}: DocumentsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Document filter tabs"
      className="flex items-end gap-1 overflow-x-auto border-b border-border-light"
    >
      {TABS.map(({ id, label }) => {
        const count = tabCount(counts, id);
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onTabChange(id)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1.5 text-sm font-medium transition ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
            }`}
          >
            {label}
            {count > 0 ? (
              <span
                className={`inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                  isActive
                    ? "bg-accent-light text-accent"
                    : "bg-surface-tertiary text-text-muted"
                }`}
              >
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
