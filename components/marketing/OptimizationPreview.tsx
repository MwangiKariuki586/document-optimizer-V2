const suggestions = [
  {
    type: "Clarity",
    title: "Simplify this sentence",
    original: "The initiative has the potential to significantly impact our market presence.",
    suggested: "This initiative can significantly improve our market presence.",
  },
  {
    type: "Tone",
    title: "Make tone more confident",
    original: "We hope to see an increase in customer engagement.",
    suggested: "We will drive measurable growth in customer engagement.",
  },
];

const quality = [
  { label: "Clarity", value: 88 },
  { label: "Structure", value: 84 },
  { label: "Readability", value: 87 },
  { label: "Tone", value: 82 },
];

export function OptimizationPreview() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-[1200px] rounded-2xl border border-border-light bg-surface p-2 shadow-card">
        <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-lg text-text-muted">&lt;</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-lighter text-xs font-bold text-accent">
              D
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                Q2 Marketing Strategy.docx
              </p>
            </div>
            <span className="hidden rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success-foreground sm:inline-flex">
              Structure Preserved
            </span>
          </div>
          <div className="hidden items-center gap-3 text-sm text-text-secondary md:flex">
            <span>Preview</span>
            <span className="rounded-md border border-border px-3 py-1 font-medium">
              100%
            </span>
            <span className="rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground">
              Export
            </span>
          </div>
        </div>

        <div className="grid gap-4 bg-surface-secondary p-4 lg:grid-cols-[270px_minmax(0,1fr)_270px]">
          <aside className="rounded-2xl border border-border bg-surface p-4 shadow-card-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">
                AI Suggestions
              </h2>
              <span className="rounded-full bg-accent-lighter px-2 py-0.5 text-xs font-medium text-accent">
                12
              </span>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {["All 12", "Clarity 5", "Tone 3", "Structure 2"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-2 py-1 text-xs font-medium text-text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <article
                  key={suggestion.type}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-ai-light px-2 py-0.5 text-xs font-medium text-ai-dark">
                      {suggestion.type}
                    </span>
                    <span className="text-text-muted">-&gt;</span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {suggestion.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">
                    {suggestion.original}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-accent">
                    Suggested: {suggestion.suggested}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                      Apply
                    </span>
                    <span className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary">
                      Ignore
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <main className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft md:p-8">
            <div className="mx-auto max-w-[760px]">
              <h2 className="text-[28px] font-bold leading-9 text-text-primary md:text-[34px] md:leading-[42px]">
                Q2 Marketing Strategy
              </h2>
              <h3 className="mt-7 text-lg font-semibold text-text-primary">
                Executive Summary
              </h3>
              <p className="mt-4 rounded-md bg-accent-lighter p-3 text-sm leading-6 text-text-primary">
                The initiative has the potential to significantly impact our
                market presence by enhancing brand awareness, increasing
                customer engagement, and accelerating revenue growth through
                targeted campaigns and content initiatives.
              </p>
              <h3 className="mt-7 text-lg font-semibold text-text-primary">
                Key Objectives
              </h3>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-text-primary">
                <li>Increase website traffic by 25%</li>
                <li>Generate 500+ qualified leads</li>
                <li>Improve conversion rate by 18%</li>
                <li>Strengthen brand positioning in target markets</li>
              </ul>
              <h3 className="mt-7 text-lg font-semibold text-text-primary">
                Strategy Overview
              </h3>
              <p className="mt-4 rounded-md bg-ai-muted p-3 text-sm leading-6 text-text-primary">
                Our approach combines data-driven content marketing, strategic
                partnerships, and performance advertising to maximize impact
                across key channels.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 rounded-xl border border-border bg-surface-secondary p-3 text-xs font-medium text-text-secondary">
                <span>Structure Preserved</span>
                <span>Formatting Preserved</span>
                <span>Preview-First Edits</span>
              </div>
            </div>
          </main>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
              <h2 className="text-base font-semibold text-text-primary">
                Document Quality
              </h2>
              <div className="mt-5 flex items-center gap-4">
                <div className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(var(--color-accent)_86%,var(--color-accent-light)_0)]">
                  <div className="flex size-14 items-center justify-center rounded-full bg-surface text-2xl font-bold text-text-primary">
                    86
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    Great Progress!
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    Your document is clear, well-structured, and impactful.
                  </p>
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-surface-tertiary">
                <div className="h-2 w-[86%] rounded-full bg-accent" />
              </div>
              <div className="mt-5 space-y-3">
                {quality.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[80px_1fr_28px] items-center gap-2 text-xs"
                  >
                    <span className="font-medium text-text-secondary">
                      {item.label}
                    </span>
                    <span className="h-2 rounded-full bg-surface-tertiary">
                      <span
                        className="block h-2 rounded-full bg-accent"
                        style={{ width: `${item.value}%` }}
                      />
                    </span>
                    <span className="text-right font-medium text-text-primary">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
              <h2 className="text-base font-semibold text-text-primary">
                Insights
              </h2>
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <p>12 suggestions found</p>
                <p>5 clarity improvements</p>
                <p>3 tone enhancements</p>
                <p>2 structure refinements</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
