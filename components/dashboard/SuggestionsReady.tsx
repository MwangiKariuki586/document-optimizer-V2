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
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold leading-7 text-text-primary">
          Suggestions Ready
        </h2>
        <span className="rounded-full bg-accent-lighter px-2 py-0.5 text-xs font-medium text-accent">
          12
        </span>
      </div>
      <div className="mt-4 min-w-0 divide-y divide-border-light">
        {suggestions.map(({ documentTitle, impact, kind, title, variant }) => {
          const Icon = suggestionIcons[kind];

          return (
          <div key={`${kind}-${documentTitle}-${title}`} className="flex min-w-0 items-center gap-3 py-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${variantClasses[variant]}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {title}
              </p>
              <p className="mt-1 truncate text-xs text-text-muted">
                {documentTitle}
              </p>
            </div>
            <span className="text-xs font-medium text-accent">{impact}</span>
          </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent-lighter px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent-light"
      >
        Review All Suggestions
        <ArrowRight className="size-4" />
      </button>
    </section>
  );
}
