import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function NewDocumentLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Create"
        title="Upload / Create Document"
        description="Upload an existing file, start from scratch, or paste your text to get started. We'll help you improve it with AI."
      />

      <div
        className="grid gap-5 lg:min-h-[max(420px,calc(100dvh-13rem))] lg:grid-cols-[minmax(0,1fr)_280px]"
        aria-busy="true"
        aria-label="Loading document creation workspace"
      >
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-surface shadow-card-soft">
          <div className="grid grid-cols-2 border-b border-border p-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="mx-2 h-9 animate-pulse rounded-md bg-surface-tertiary"
              />
            ))}
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center p-6">
            <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-secondary p-6">
              <div className="size-12 animate-pulse rounded-xl bg-surface-tertiary" />
              <div className="mt-5 h-5 w-56 max-w-full animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-3 h-3 w-72 max-w-full animate-pulse rounded bg-surface-tertiary" />
              <div className="mt-6 h-10 w-36 animate-pulse rounded-md bg-surface-tertiary" />
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4 lg:self-start">
          <div className="min-h-40 rounded-2xl border border-accent-light bg-surface p-5 shadow-card-soft">
            <div className="h-5 w-36 animate-pulse rounded bg-surface-tertiary" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="size-8 shrink-0 animate-pulse rounded-lg bg-surface-tertiary" />
                  <div className="h-3 flex-1 animate-pulse rounded bg-surface-tertiary" />
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-56 rounded-2xl border border-border bg-surface p-5 shadow-card-soft">
            <div className="h-5 w-40 animate-pulse rounded bg-surface-tertiary" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="size-8 shrink-0 animate-pulse rounded-full bg-surface-tertiary" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-surface-tertiary" />
                    <div className="h-3 w-full animate-pulse rounded bg-surface-tertiary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto h-3 w-72 max-w-full animate-pulse rounded bg-surface-tertiary" />
    </PageShell>
  );
}
