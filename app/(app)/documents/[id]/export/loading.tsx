import { PageHeader } from "@/components/layout/PageHeader";

export default function DocumentExportLoading() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
      aria-busy="true"
      aria-label="Loading export workspace"
    >
      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1600px] gap-3 xl:grid-rows-1 xl:overflow-hidden">
        <div className="grid min-h-0 gap-3 overflow-hidden xl:h-full xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-h-0 overflow-y-auto rounded-xl">
            <div className="pb-5">
              <PageHeader
                eyebrow="Export workspace"
                title="Export Document"
                description="Choose how you want to export your optimized document."
              />
            </div>

            <div className="h-4 w-44 animate-pulse rounded bg-surface-tertiary" />
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-xl border border-border bg-surface-tertiary"
                />
              ))}
            </div>

            <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-card-soft">
              <div className="h-5 w-36 animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-lg bg-surface-tertiary"
                  />
                ))}
              </div>
            </section>

            <div className="mt-6 h-24 animate-pulse rounded-xl border border-warning-light bg-warning-muted" />
          </section>

          <aside className="min-h-[480px] rounded-xl border border-border bg-surface p-5 shadow-card-soft">
            <div className="h-5 w-36 animate-pulse rounded bg-surface-tertiary" />
            <div className="mt-5 h-20 animate-pulse rounded-xl bg-surface-tertiary" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-surface-tertiary" />
                  <div className="h-3 w-16 animate-pulse rounded bg-surface-tertiary" />
                </div>
              ))}
            </div>
            <div className="mt-8 h-11 w-full animate-pulse rounded-md bg-surface-tertiary" />
          </aside>
        </div>
      </div>
    </main>
  );
}
