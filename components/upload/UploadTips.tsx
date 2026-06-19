// Server component — static tips content, no interactivity needed
import { CheckCircle2, Sparkles } from "lucide-react";

const TIPS = [
  {
    headline: "Upload clean, readable documents",
    detail: "Scanned PDFs may have limited accuracy.",
  },

  {
    headline: "Review suggestions before applying",
    detail: "You're always in control of what changes.",
  },
  {
    headline: "Provide context (coming soon)",
    detail: "Add audience or goal to get more tailored suggestions.",
  },
];

export function UploadTips() {
  return (
    <aside
      className="rounded-2xl border border-accent-light bg-surface p-5 shadow-card-soft"
      aria-label="Tips for best results"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 shrink-0 text-accent" aria-hidden="true" />
        <h2 className="text-sm font-semibold leading-5 text-text-primary">
          Tips for best results
        </h2>
      </div>
      <p className="mt-2 text-xs leading-5 text-text-secondary">
        A few things you can do to get better AI suggestions.
      </p>

      <ul className="mt-4 space-y-4" role="list">
        {TIPS.map(({ headline, detail }) => (
          <li key={headline} className="flex items-start gap-3">
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
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-5 text-text-primary">
                {headline}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                {detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
