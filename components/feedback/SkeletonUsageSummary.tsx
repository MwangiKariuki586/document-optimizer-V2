export function SkeletonUsageSummary() {
  return (
    <aside className="min-w-0 space-y-6">
      <section className="flex h-[420px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
        <div className="flex shrink-0 items-center justify-between">
          <div>
            {/* section title removed for cleaner skeleton */}
            <div className="mt-2 h-3 w-40 rounded bg-surface-tertiary animate-pulse" />
          </div>
          <div className="h-8 w-28 rounded bg-surface-tertiary animate-pulse" />
        </div>

        <div className="relative mx-auto mt-3 flex size-[116px] shrink-0 items-center justify-center">
          <div className="relative flex size-[84px] flex-col items-center justify-center rounded-full border border-8 border-border-light bg-surface">
            <div className="h-8 w-8 rounded bg-surface-tertiary animate-pulse" />
            <div className="mt-2 h-3 w-10 rounded bg-surface-tertiary animate-pulse" />
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="">
              <div className="mb-0.5 flex items-center justify-between gap-4 text-sm leading-5">
                <div className="h-3 w-24 rounded bg-surface-tertiary animate-pulse" />
                <div className="h-3 w-10 rounded bg-surface-tertiary animate-pulse" />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-tertiary">
                <div className="h-full w-1/4 rounded-full bg-surface-secondary animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="h-10 w-full rounded-md bg-surface-secondary animate-pulse" />
        </div>
      </section>

      <section className="flex h-[300px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
        {/* section title removed for cleaner skeleton */}
        <div className="mt-4 grid min-h-0 flex-1 items-center gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full p-3">
            <div className="flex size-full flex-col items-center justify-center rounded-full bg-surface">
              <div className="h-8 w-12 rounded bg-surface-tertiary animate-pulse" />
              <div className="mt-1 h-3 w-16 rounded bg-surface-tertiary animate-pulse" />
            </div>
          </div>

          <div className="min-w-0 space-y-2.5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="size-3 shrink-0 rounded-full bg-surface-tertiary animate-pulse" />
                <div className="min-w-0 h-4 w-32 rounded bg-surface-tertiary animate-pulse" />
                <div className="ml-auto h-4 w-12 rounded bg-surface-tertiary animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
