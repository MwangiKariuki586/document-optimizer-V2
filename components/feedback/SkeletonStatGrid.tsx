export function SkeletonStatGrid() {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <article
          key={i}
          className="relative flex min-h-[152px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft"
        >
          {/* header label removed — keep spacing/layout intact */}
          <div className="flex items-center gap-2.5 px-4 pt-6 pb-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-tertiary animate-pulse" />
            <div className="min-w-0 space-y-1">
              <div className="h-3 w-32 rounded-full bg-surface-tertiary animate-pulse" />
              <div className="h-2 w-20 rounded-full bg-surface-tertiary animate-pulse" />
            </div>
          </div>

          <div className="flex min-h-19 flex-1 flex-col justify-center px-4 py-3">
            <div className="h-8 w-40 rounded bg-surface-tertiary animate-pulse" />
            <div className="mt-2 h-3 w-28 rounded-full bg-surface-tertiary animate-pulse" />
          </div>

          <div className="px-4 py-4.5">
            <div className="h-1.5 rounded-full bg-surface-tertiary">
              <div className="h-1.5 rounded-full bg-surface-secondary w-1/4 animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
