export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <section className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface px-6 pt-6 pb-6 shadow-card-soft">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div>
          <div className="h-5 w-40 rounded bg-surface-tertiary animate-pulse" />
          <div className="mt-1 h-3 w-60 rounded bg-surface-tertiary animate-pulse" />
        </div>

        <div className="h-4 w-28 rounded bg-surface-tertiary animate-pulse" />
      </div>

      <div className="scrollbar-hidden mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
        <div className="hidden md:block">
          <table className="w-full min-w-[760px] border-collapse">
            <tbody className="divide-y divide-border-light">
              {Array.from({ length: rows }).map((_, idx) => (
                <tr key={idx} className="text-sm text-text-primary">
                  <td className="py-4 pr-4">
                    <div className="flex gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary animate-pulse" />
                      <div className="min-w-0">
                        <div className="h-4 w-48 rounded bg-surface-tertiary animate-pulse" />
                        <div className="mt-1 h-3 w-32 rounded bg-surface-tertiary animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-12 rounded bg-surface-tertiary animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-20 rounded bg-surface-tertiary animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-24 rounded bg-surface-tertiary animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-16 rounded bg-surface-tertiary animate-pulse" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-3 w-12 rounded bg-surface-tertiary animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border-light bg-surface p-4"
            >
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary animate-pulse" />
                <div className="min-w-0">
                  <div className="h-4 w-40 rounded bg-surface-tertiary animate-pulse" />
                  <div className="mt-1 h-3 w-28 rounded bg-surface-tertiary animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
