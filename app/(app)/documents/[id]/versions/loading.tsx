import { PageHeader } from "@/components/layout/PageHeader";

export default function DocumentVersionsLoading() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
      aria-busy="true"
      aria-label="Loading version history"
    >
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden">
        <div className="flex min-h-0 flex-col gap-3 overflow-hidden xl:h-full">
          <div className="flex shrink-0 flex-col gap-2 rounded-xl">
            <PageHeader
              eyebrow="Versions"
              title="Version History"
              description="Compare saved versions, inspect document changes, and restore a previous state when needed."
              actions={
                <div className="flex items-center gap-2">
                  <div className="size-9 animate-pulse rounded-md bg-surface-tertiary" />
                  <div className="size-9 animate-pulse rounded-md bg-surface-tertiary" />
                </div>
              }
            />
            <div className="flex gap-2 pt-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-28 animate-pulse rounded bg-surface-tertiary"
                />
              ))}
            </div>
          </div>

          <div className="grid min-h-[560px] flex-1 gap-3 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)] xl:min-h-0 xl:grid-cols-[240px_minmax(0,1fr)_288px]">
            <aside className="rounded-xl border border-border bg-surface p-3 shadow-card-soft">
              <div className="h-5 w-28 animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 animate-pulse rounded-lg bg-surface-tertiary"
                  />
                ))}
              </div>
            </aside>

            <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
              <div className="flex items-center justify-between">
                <div className="h-5 w-44 animate-pulse rounded bg-surface-tertiary" />
                <div className="h-8 w-32 animate-pulse rounded-md bg-surface-tertiary" />
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, paneIndex) => (
                  <div
                    key={paneIndex}
                    className="min-h-[430px] rounded-lg border border-border-light p-4"
                  >
                    <div className="h-4 w-32 animate-pulse rounded bg-surface-tertiary" />
                    <div className="mt-5 space-y-4">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <div
                          key={index}
                          className={`h-3 animate-pulse rounded bg-surface-tertiary ${index % 3 === 2 ? "w-4/5" : "w-full"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="hidden rounded-xl border border-border bg-surface p-4 shadow-card-soft xl:block">
              <div className="h-5 w-36 animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 animate-pulse rounded-lg bg-surface-tertiary"
                  />
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
