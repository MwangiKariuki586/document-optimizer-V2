export default function DocumentPreviewLoading() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
      aria-busy="true"
      aria-label="Loading document preview"
    >
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:overflow-hidden">
        <section className="min-w-0 xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:overflow-hidden">
          <div className="grid min-h-0 gap-3 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_300px] xl:overflow-hidden">
            <div className="grid min-h-[540px] min-w-0 gap-3 lg:grid-cols-2 xl:min-h-0 xl:overflow-hidden">
              {Array.from({ length: 2 }).map((_, paneIndex) => (
                <article
                  key={paneIndex}
                  className="flex min-h-0 flex-col rounded-xl border border-border bg-surface shadow-card-soft"
                >
                  <div className="flex items-center justify-between border-b border-border-light p-3">
                    <div className="h-4 w-36 animate-pulse rounded bg-surface-tertiary" />
                    <div className="h-7 w-20 animate-pulse rounded-md bg-surface-tertiary" />
                  </div>
                  <div className="min-h-0 flex-1 space-y-4 p-5">
                    <div className="h-7 w-3/5 animate-pulse rounded bg-surface-tertiary" />
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-3 animate-pulse rounded bg-surface-tertiary ${index % 4 === 3 ? "w-3/4" : "w-full"}`}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <aside className="flex min-h-[420px] flex-col gap-3 rounded-xl bg-accent-muted xl:min-h-0">
              <div className="rounded-xl border border-border-light bg-surface p-3">
                <div className="h-9 w-full animate-pulse rounded-md bg-surface-tertiary" />
              </div>
              <div className="min-h-0 flex-1 rounded-xl border border-border bg-surface p-4 shadow-card-soft">
                <div className="h-5 w-40 animate-pulse rounded bg-surface-tertiary" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-10 animate-pulse rounded-lg bg-surface-tertiary"
                    />
                  ))}
                </div>
                <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-surface-tertiary" />
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
