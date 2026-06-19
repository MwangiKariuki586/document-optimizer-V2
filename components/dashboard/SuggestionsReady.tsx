import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileText, PenLine, Search, Sparkles } from "lucide-react";

type SuggestionItem = {
  documentTitle: string;
  impact: string;
  kind: "clarity" | "grammar" | "seo" | "structure" | "tone";
  title: string;
  variant: "ai" | "info" | "warning";
};

type SuggestionsReadyProps = {
  suggestions: SuggestionItem[];
};

const variantClasses: Record<SuggestionItem["variant"], string> = {
  ai: "bg-ai-muted text-ai-dark",
  info: "bg-info-muted text-info-foreground",
  warning: "bg-warning-muted text-warning-foreground",
};

const suggestionIcons: Record<SuggestionItem["kind"], LucideIcon> = {
  clarity: Sparkles,
  grammar: FileText,
  seo: Search,
  structure: FileText,
  tone: PenLine,
};

export function SuggestionsReady({ suggestions }: SuggestionsReadyProps) {
  const suggestionCount = suggestions.length;
  const visibleSuggestions = suggestions.slice(0, 3);

  return (
    <section className="flex h-[280px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Suggestions Ready
        </h2>
        <span className="rounded-full bg-accent-lighter px-2 py-0.5 text-xs font-medium text-accent">
          {suggestionCount}
        </span>
      </div>
      {suggestionCount > 0 ? (
        <div className="scrollbar-hidden mt-4 min-h-0 flex-1 divide-y divide-border-light overflow-y-auto pb-2">
          {visibleSuggestions.map(
            ({ documentTitle, impact, kind, title, variant }) => {
              const Icon = suggestionIcons[kind];

              return (
                <div
                  key={`${kind}-${documentTitle}-${title}`}
                  className="flex min-w-0 items-center gap-3 py-3"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${variantClasses[variant]}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {title}
                    </p>
                    <p className="mt-1 truncate text-sm text-text-secondary">
                      {documentTitle}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-accent">
                    {impact}
                  </span>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center py-5">
          <div className="flex items-start gap-3 rounded-xl bg-accent-lighter px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-accent">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                No suggestions ready.
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Run an AI action from a document to generate improvements.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
