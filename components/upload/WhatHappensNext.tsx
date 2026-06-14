// Server component — no interactivity needed
import { ShieldCheck } from "lucide-react";

const STEPS = [
  {
    num: 1,
    text: "We analyze your document structure, content, and formatting.",
  },
  {
    num: 2,
    text: "You'll get AI suggestions to improve clarity, tone, and structure.",
  },
  {
    num: 3,
    text: "Review, apply, and export your optimized document.",
  },
];

export function WhatHappensNext() {
  return (
    <aside
      className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
      aria-label="What happens after upload"
    >
      <h2 className="text-sm font-semibold leading-5 text-text-primary">
        What happens next?
      </h2>

      <ol className="mt-4 space-y-4" role="list">
        {STEPS.map(({ num, text }) => (
          <li key={num} className="flex gap-3">
            {/* Step number chip */}
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-lighter text-xs font-bold leading-none text-accent"
              aria-hidden="true"
            >
              {num}
            </span>
            <p className="text-sm leading-5 text-text-secondary">{text}</p>
          </li>
        ))}
      </ol>

      {/* Privacy assurance note */}
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border-light bg-success-muted px-3 py-2">
        <ShieldCheck className="size-4 shrink-0 text-success-foreground" aria-hidden="true" />
        <p className="text-xs leading-4 text-success-foreground">
          Your files are private and secure.
        </p>
      </div>
    </aside>
  );
}
