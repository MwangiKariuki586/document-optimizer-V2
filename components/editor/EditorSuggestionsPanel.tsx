import { Download, MoreVertical, Sparkles, X } from "lucide-react";

export type SuggestionType = "Clarity" | "Tone" | "Structure" | "SEO";

export type EditorSuggestion = {
  id: string;
  index: number;
  type: SuggestionType;
  current?: string;
  suggested?: string;
  note?: string;
};

export type SuggestionFilter = {
  key: string;
  label: string;
  count: number;
};

type EditorSuggestionsPanelProps = {
  open: boolean;
  onClose: () => void;
  onReopen: () => void;
  suggestions: EditorSuggestion[];
  filters: SuggestionFilter[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
  totalCount: number;
};

const typeBadgeClasses: Record<SuggestionType, string> = {
  Clarity: "bg-info-muted text-info-foreground",
  Tone: "bg-ai-muted text-ai-dark",
  Structure: "bg-warning-muted text-warning-foreground",
  SEO: "bg-success-muted text-success-foreground",
};

export function EditorSuggestionsPanel({
  open,
  onClose,
  onReopen,
  suggestions,
  filters,
  activeFilter,
  onFilterChange,
  totalCount,
}: EditorSuggestionsPanelProps) {
  return (
    <div className="flex flex-col xl:h-full xl:min-h-0">
      {open ? (
        <section className="flex flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
          <div className="grid shrink-0 grid-cols-2 gap-3 border-b border-border-light p-3">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-xs font-medium text-accent transition hover:bg-surface-secondary"
            >
              <Download className="size-4" />
              Export
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-card-soft transition hover:bg-accent-dark"
            >
              <Sparkles className="size-4" />
              AI Assistant
            </button>
          </div>

          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-ai" />
              <h2 className="text-sm font-semibold text-text-primary">
                AI Suggestions
              </h2>
              <span className="rounded-full bg-ai-light px-2 py-0.5 text-xs font-semibold text-ai-dark">
                {totalCount}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
              title="Close suggestions"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border-light px-3 py-2">
            {filters.map((filter) => {
              const isActive = filter.key === activeFilter;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => onFilterChange(filter.key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-accent-light text-accent"
                      : "text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  {filter.label} {filter.count}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto p-3 xl:min-h-0 xl:flex-1">
            {suggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-lg border border-border bg-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md bg-surface-tertiary text-[11px] font-semibold text-text-secondary">
                      {suggestion.index}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClasses[suggestion.type]}`}
                    >
                      {suggestion.type}
                    </span>
                  </div>
                  {suggestion.current && suggestion.suggested ? (
                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-text-soft" />
                        Current
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-success" />
                        Suggested
                      </span>
                    </div>
                  ) : null}
                </div>

                {suggestion.current && suggestion.suggested ? (
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                        Current
                      </p>
                      <p className="mt-1 text-xs leading-5 text-text-secondary">
                        {suggestion.current}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-success-foreground">
                        Suggested
                      </p>
                      <p className="mt-1 text-xs leading-5 text-text-primary">
                        {suggestion.suggested}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-text-secondary">
                    {suggestion.note}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-accent-dark"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
                  >
                    Ignore
                  </button>
                  <button
                    type="button"
                    className="ml-auto flex size-7 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
                    title="More options"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="shrink-0 border-t border-border-light p-3">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-light"
            >
              <Sparkles className="size-4" />
              Apply All {totalCount} Suggestions
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={onReopen}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary"
        >
          <Sparkles className="size-4 text-ai" />
          Show AI Suggestions
        </button>
      )}
    </div>
  );
}
