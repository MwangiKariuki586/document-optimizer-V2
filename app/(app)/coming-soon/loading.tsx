import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function ComingSoonLoading() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Product roadmap"
        title="Coming soon"
        description="This feature is planned, but it is not available in the current workspace yet."
      />

      <section
        className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
        aria-busy="true"
        aria-label="Loading roadmap content"
      >
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto size-14 animate-pulse rounded-2xl bg-surface-tertiary" />
          <div className="mx-auto mt-5 h-3 w-24 animate-pulse rounded bg-surface-tertiary" />
          <div className="mx-auto mt-3 h-8 w-80 max-w-full animate-pulse rounded bg-surface-tertiary" />
          <div className="mx-auto mt-4 h-3 w-full animate-pulse rounded bg-surface-tertiary" />
          <div className="mx-auto mt-2 h-3 w-4/5 animate-pulse rounded bg-surface-tertiary" />
          <div className="mx-auto mt-6 h-10 w-24 animate-pulse rounded-md bg-surface-tertiary" />
        </div>
      </section>
    </PageShell>
  );
}
