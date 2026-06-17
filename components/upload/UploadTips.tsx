// Server component — static tips content, no interactivity needed
import { CheckCircle2, Sparkles } from "lucide-react";

const TIPS = [
  {
    headline: "Upload clean, readable documents",
    detail: "Scanned PDFs may have limited accuracy.",
  },
  {
    headline: "Provide context (coming soon)",
    detail: "Add audience or goal to get more tailored suggestions.",
  },
  {
    headline: "Review suggestions before applying",
    detail: "You're always in control of what changes.",
  },
];

export function UploadTips() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-accent-light bg-accent-muted p-6 shadow-sm md:p-8"
      aria-label="Tips for best results"
    >
      {/* Decorative sparkle accents matching the design */}
      <Sparkles
        className="absolute left-1/2 top-8 size-4 text-accent-light opacity-50"
        aria-hidden="true"
      />
      <Sparkles
        className="absolute right-32 top-10 size-6 text-accent-light"
        aria-hidden="true"
      />
      <Sparkles
        className="absolute right-12 top-24 size-4 text-accent-light opacity-50"
        aria-hidden="true"
      />
      <Sparkles
        className="absolute bottom-10 right-20 size-5 text-accent-light"
        aria-hidden="true"
      />

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        {/* Left: tips content */}
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-bold text-text-primary">
              Tips for best results
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">
            A few things you can do to get better AI suggestions.
          </p>

          <ul className="mt-6 space-y-5" role="list">
            {TIPS.map(({ headline, detail }) => (
              <li key={headline} className="flex items-start gap-3">
                {/* Design checkmark: solid accent circle with white check */}
                <div className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <CheckCircle2
                    className="absolute inset-0 size-5 text-accent"
                    aria-hidden="true"
                  />
                  <svg
                    className="relative z-10 size-3 text-accent-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{headline}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: AI suggestion visual illustration */}
        <div
          className="hidden min-w-[280px] items-center justify-center md:flex"
          aria-hidden="true"
        >
          <div className="relative w-[240px] rounded-xl border border-border-light bg-surface p-5 shadow-sm">
            {/* Fake document lines */}
            <div className="space-y-3">
              <div className="h-2 w-full rounded-full bg-border-muted" />
              <div className="h-2 w-4/5 rounded-full bg-border-muted" />
              <div className="h-2 w-full rounded-full bg-border-muted" />
              <div className="h-3 w-full rounded-full bg-accent-light opacity-50" />
              <div className="h-3 w-3/5 rounded-full bg-accent-light opacity-50" />
              <div className="h-2 w-full rounded-full bg-border-muted" />
              <div className="h-2 w-4/5 rounded-full bg-border-muted" />
              <div className="h-2 w-full rounded-full bg-border-muted" />
            </div>

            {/* AI suggestion chip matching design */}
            <div className="absolute -bottom-6 -right-6 w-[200px] rounded-xl border border-border-light bg-surface p-4 shadow-lg">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-accent" />
                <span className="text-xs font-bold text-text-primary">AI Suggestion</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-text-secondary">
                Consider simplifying this sentence for clarity and impact.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm"
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
                >
                  Ignore
                </button>
              </div>
              {/* Pointer cursor graphic */}
              <svg className="absolute -bottom-4 right-10 size-6 text-text-primary drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 5V2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
