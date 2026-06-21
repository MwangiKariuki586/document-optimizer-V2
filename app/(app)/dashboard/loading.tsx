import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { SkeletonStatGrid } from "@/components/feedback/SkeletonStatGrid";
import { SkeletonTable } from "@/components/feedback/SkeletonTable";
import { SkeletonPanel } from "@/components/feedback/SkeletonPanel";
import { SkeletonUsageSummary } from "@/components/feedback/SkeletonUsageSummary";

export default function DashboardLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Dashboard"
        title="Dashboard Workspace"
        description="Optimize documents with AI while tracking formatting confidence, document activity, and usage."
      />

      <section className="grid min-w-0 items-start gap-6 xl:grid-cols-12">
        <main className="min-w-0 space-y-6 xl:col-span-8">
          <section className="grid min-w-0 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[94px] min-w-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 shadow-card-soft"
              >
                <div className="size-11 shrink-0 animate-pulse rounded-xl bg-surface-tertiary" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-tertiary" />
                  <div className="mt-2 h-3 w-44 max-w-full animate-pulse rounded bg-surface-tertiary" />
                </div>
              </div>
            ))}
          </section>

          <SkeletonStatGrid />

          <SkeletonTable rows={5} />

          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonPanel />
            <SkeletonPanel />
          </div>
        </main>

        <div className="xl:col-span-4">
          <SkeletonUsageSummary />
        </div>
      </section>
    </PageShell>
  );
}
