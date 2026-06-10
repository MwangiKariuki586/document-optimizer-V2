import { SkeletonBlock } from "@/components/feedback/SkeletonBlock";
import { PageShell } from "@/components/layout/PageShell";

export default function AppLoading() {
  return (
    <PageShell>
      <SkeletonBlock lines={4} />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={3} />
      </div>
    </PageShell>
  );
}
