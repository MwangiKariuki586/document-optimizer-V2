/**
 * SkeletonPanel
 * ---------------
 * Generic list-style skeleton used for small panels like
 * `SuggestionsReady` and `RecentActivity`.
 *
 * Usage:
 * - Change `rows` to control how many placeholder items appear.
 */
type Props = {
  rows?: number;
};

export function SkeletonPanel({ rows = 3 }: Props) {
  return (
    <section className="flex h-[280px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          {/* section title removed for cleaner skeleton */}
          <div className="mt-2 h-3 w-40 rounded bg-surface-tertiary animate-pulse" />
        </div>
        <div className="h-4 w-8 rounded bg-surface-tertiary animate-pulse" />
      </div>

      <div className="mt-4 min-h-0 flex-1 divide-y divide-border-light overflow-y-auto pb-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-40 rounded bg-surface-tertiary animate-pulse" />
              <div className="mt-1 h-3 w-28 rounded bg-surface-tertiary animate-pulse" />
            </div>
            <div className="h-4 w-10 rounded bg-surface-tertiary animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
