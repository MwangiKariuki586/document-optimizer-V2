import { SkeletonStatGrid } from "@/components/feedback/SkeletonStatGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function DocumentsLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Documents"
        title="Documents Library"
        description="Manage uploaded and pasted documents in one place."
        actions={
          <div className="h-10 w-40 animate-pulse rounded-md bg-surface-tertiary" />
        }
      />

      <SkeletonStatGrid />

      <section
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
        aria-busy="true"
        aria-label="Loading documents"
      >
        <div className="flex items-end gap-3 overflow-hidden border-b border-border-light pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-7 w-24 shrink-0 animate-pulse rounded bg-surface-tertiary"
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 min-w-56 flex-1 animate-pulse rounded-md bg-surface-tertiary" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-32 animate-pulse rounded-md bg-surface-tertiary"
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[2fr_repeat(6,minmax(70px,1fr))_48px] gap-4 border-b border-border-light bg-surface-secondary px-4 py-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-3 animate-pulse rounded bg-surface-tertiary"
                />
              ))}
            </div>
            <div className="divide-y divide-border-light">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_repeat(6,minmax(70px,1fr))_48px] items-center gap-4 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 shrink-0 animate-pulse rounded-lg bg-surface-tertiary" />
                    <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface-tertiary" />
                  </div>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="h-3 animate-pulse rounded bg-surface-tertiary"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[120px] animate-pulse rounded-xl border border-border bg-surface-tertiary"
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-tertiary" />
          <div className="h-9 w-56 animate-pulse rounded-md bg-surface-tertiary" />
        </div>
      </section>
    </PageShell>
  );
}
