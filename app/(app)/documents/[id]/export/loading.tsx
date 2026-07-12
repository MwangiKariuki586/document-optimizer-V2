import { PageHeader } from "@/components/layout/PageHeader";

export default function DocumentExportLoading() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col bg-background px-3 py-3 md:px-5 xl:h-screen xl:max-h-screen xl:overflow-hidden"
      aria-busy="true"
      aria-label="Loading export workspace"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-3 xl:h-full xl:overflow-hidden">
        <div className="rounded-xl bg-transparent px-0 py-0">
          <PageHeader
            eyebrow="Export workspace"
            title="Export Document"
            description="Choose how you want to export your optimized document."
          />
        </div>

        <div className="grid min-h-0 gap-3 xl:h-full xl:grid-cols-[minmax(0,1fr)_320px] xl:overflow-hidden">
          <section className="min-h-0 overflow-y-auto rounded-xl">
            <div className="h-4 w-44 animate-pulse rounded bg-surface-tertiary" />

            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[164px] rounded-xl border border-border bg-surface p-4 shadow-card-soft"
                >
                  <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-tertiary" />
                  <div className="mt-4 h-4 w-28 animate-pulse rounded bg-surface-tertiary" />
                  <div className="mt-2 h-3 w-12 animate-pulse rounded bg-surface-tertiary" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-surface-tertiary" />
                    <div className="h-3 w-10/12 animate-pulse rounded bg-surface-tertiary" />
                    <div className="h-3 w-7/12 animate-pulse rounded bg-surface-tertiary" />
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-card-soft">
              <div className="h-5 w-36 animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-lg bg-surface-tertiary"
                  />
                ))}
              </div>
            </section>

            <div className="mt-6 h-24 animate-pulse rounded-xl border border-border bg-surface">
              <div className="ml-6 mt-4 h-4 w-96 animate-pulse rounded-xl  bg-surface-tertiary" />
              <div className="ml-6 h-4 mt-4 w-196 animate-pulse rounded-xl  bg-surface-tertiary" />
            </div>
          </section>

          <aside className="min-h-[480px] rounded-xl border border-border bg-surface p-5 shadow-card-soft xl:mt-7">
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
