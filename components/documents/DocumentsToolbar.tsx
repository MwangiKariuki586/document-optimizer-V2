"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

type DocumentsToolbarProps = {
  search: string;
  status: string;
  type: string;
  fidelity: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onFidelityChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "ready", label: "Ready" },
  { value: "draft", label: "Draft" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
  { value: "archived", label: "Archived" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "markdown", label: "Markdown" },
  { value: "txt", label: "TXT" },
];

const FIDELITY_OPTIONS = [
  { value: "all", label: "All Fidelity" },
  { value: "Structure Preserved", label: "Structure Preserved" },
  { value: "Original Preserved", label: "Original Preserved" },
  { value: "Limited Formatting", label: "Limited Formatting" },
  { value: "Plain Text Only", label: "Plain Text Only" },
  {
    value: "Formatting Review Needed",
    label: "Formatting Review Needed",
  },
];

const SORT_OPTIONS = [
  { value: "lastUpdated", label: "Last Updated" },
  { value: "name", label: "Name" },
  { value: "suggestions", label: "Suggestions" },
  { value: "wordCount", label: "Word Count" },
  { value: "createdDate", label: "Created Date" },
];

const selectClass =
  "h-9 appearance-none rounded-md border border-border bg-surface py-1.5 pl-3 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";

export function DocumentsToolbar({
  search,
  status,
  type,
  fidelity,
  sort,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onFidelityChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: DocumentsToolbarProps) {
  const [draftSearch, setDraftSearch] = useState({
    base: search,
    value: search,
  });
  const localSearch =
    draftSearch.base === search ? draftSearch.value : search;

  // Debounce: push URL update 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-text-muted" />
        <input
          type="search"
          value={localSearch}
          onChange={(e) =>
            setDraftSearch({ base: search, value: e.target.value })
          }
          placeholder="Search documents…"
          className="h-9 w-full min-w-[160px] rounded-md border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          aria-label="Search documents"
        />
        {localSearch ? (
          <button
            type="button"
            onClick={() => {
              setDraftSearch({ base: "", value: "" });
              onSearchChange("");
            }}
            className="absolute right-2 flex size-5 items-center justify-center rounded text-text-muted hover:text-text-primary"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Status filter */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClass}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          ▾
        </span>
      </div>

      {/* Type filter */}
      <div className="relative">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className={selectClass}
          aria-label="Filter by type"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          ▾
        </span>
      </div>

      {/* Fidelity filter */}
      <div className="relative hidden xl:block">
        <select
          value={fidelity}
          onChange={(e) => onFidelityChange(e.target.value)}
          className={selectClass}
          aria-label="Filter by fidelity"
        >
          {FIDELITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          ▾
        </span>
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={selectClass}
          aria-label="Sort documents"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
          ▾
        </span>
      </div>

      {/* Clear filters */}
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-sm text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
        >
          <X className="size-3.5" />
          Clear
        </button>
      ) : null}
    </div>
  );
}
