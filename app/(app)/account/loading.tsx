import { SkeletonBlock } from "@/components/feedback/SkeletonBlock";
import { SkeletonStatGrid } from "@/components/feedback/SkeletonStatGrid";
import { PageHeader } from "@/components/layout/PageHeader";

export default function AccountLoading() {
  return (
    <main className="flex-1 bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <PageHeader
          eyebrow="Account"
          title="Account and usage"
          description="Manage account settings, usage activity, and recent document work."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <SkeletonStatGrid />

            <div className="grid gap-4 lg:grid-cols-2">
              <SkeletonBlock className="min-h-[500px]" lines={6} />
              <SkeletonBlock className="min-h-[500px]" lines={6} />
            </div>

            <SkeletonBlock className="min-h-[340px]" lines={5} />
          </div>

          <aside className="space-y-3">
            <SkeletonBlock lines={3} />
            <SkeletonBlock lines={4} />
            <SkeletonBlock lines={3} />
            <SkeletonBlock lines={4} />
            <SkeletonBlock lines={4} />
          </aside>
        </div>
      </div>
    </main>
  );
}
