export default function DocumentEditorLoading() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
      aria-busy="true"
      aria-label="Loading document editor"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-3 xl:overflow-hidden">
        <div className="grid min-h-0 gap-3 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:grid-rows-1 xl:overflow-hidden">
          <section className="order-1 flex min-h-0 flex-col gap-2 xl:overflow-hidden">
            <div className="shrink-0 rounded-xl border border-border bg-surface shadow-card-soft">
              <div className="flex min-h-12 items-center justify-between gap-4 px-4 py-2">
                <div className="h-5 w-64 max-w-[50%] animate-pulse rounded bg-surface-tertiary" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 w-20 animate-pulse rounded-md bg-surface-tertiary"
                    />
                  ))}
                </div>
              </div>
              <div className="flex min-h-11 items-center gap-2 border-t border-border-light px-4 py-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="size-7 animate-pulse rounded bg-surface-tertiary"
                  />
                ))}
              </div>
            </div>

            <div className="min-h-[560px] flex-1 rounded-xl border border-border bg-surface p-6 shadow-card-soft xl:min-h-0">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="h-8 w-3/5 animate-pulse rounded bg-surface-tertiary" />
                {Array.from({ length: 11 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-3 animate-pulse rounded bg-surface-tertiary ${index % 3 === 2 ? "w-4/5" : "w-full"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex h-8 shrink-0 items-center justify-between rounded-lg border border-border bg-surface px-3">
              <div className="h-3 w-32 animate-pulse rounded bg-surface-tertiary" />
              <div className="h-3 w-20 animate-pulse rounded bg-surface-tertiary" />
            </div>
          </section>

          <aside className="order-2 flex min-h-[420px] flex-col rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0">
            <div className="flex items-center justify-between border-b border-border-light p-3">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-tertiary" />
              <div className="size-8 animate-pulse rounded-md bg-surface-tertiary" />
            </div>
            <div className="flex gap-2 border-b border-border-light p-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-7 flex-1 animate-pulse rounded-md bg-surface-tertiary"
                />
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-3 p-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border-light p-3"
                >
                  <div className="h-4 w-4/5 animate-pulse rounded bg-surface-tertiary" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-surface-tertiary" />
                  <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-surface-tertiary" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
