import { SkeletonBlock } from "@/components/feedback/SkeletonBlock";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_480px]">
        <SkeletonBlock lines={5} />
        <SkeletonBlock lines={4} />
      </div>
    </main>
  );
}
