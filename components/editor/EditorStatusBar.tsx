import { CheckCircle2, ShieldCheck } from "lucide-react";

type ScoreRingProps = {
  value: string;
  ringClass: string;
};

function ScoreRing({ value, ringClass }: ScoreRingProps) {
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-full p-1 ${ringClass}`}
    >
      <span className="flex size-full items-center justify-center rounded-full bg-surface text-xs font-bold text-text-primary">
        {value}
      </span>
    </span>
  );
}

export function EditorStatusBar() {
  return (
    <section className="grid shrink-0 gap-4 rounded-xl border border-border bg-surface p-4 shadow-card-soft sm:grid-cols-2 xl:grid-cols-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success-muted text-success">
          <CheckCircle2 className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">AI Status</p>
          <p className="text-sm font-semibold text-success-foreground">
            Active
          </p>
          <p className="text-xs text-text-muted">
            All suggestions are context-aware.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ScoreRing
          value="86"
          ringClass="bg-[conic-gradient(var(--color-success)_86%,var(--color-border-light)_0)]"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">Document Health</p>
          <p className="text-sm font-semibold text-text-primary">Good</p>
          <p className="text-xs text-text-muted">Well-structured and clear.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-border bg-surface-secondary text-[10px] font-bold text-text-primary">
          Grade 8
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">Readability</p>
          <p className="text-sm font-semibold text-text-primary">Good</p>
          <p className="text-xs text-text-muted">
            Easy to read and understand.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ScoreRing
          value="79"
          ringClass="bg-[conic-gradient(var(--color-accent)_79%,var(--color-border-light)_0)]"
        />
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">SEO Score</p>
          <p className="text-sm font-semibold text-text-primary">Good</p>
          <p className="text-xs text-text-muted">Some room for improvement.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success-muted text-success">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">Version Safety</p>
          <p className="text-sm font-semibold text-text-primary">On</p>
          <button
            type="button"
            className="text-xs font-medium text-accent transition hover:text-accent-dark"
          >
            View Versions
          </button>
        </div>
      </div>
    </section>
  );
}
