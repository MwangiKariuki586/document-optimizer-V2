import { SkeletonBlock } from "@/components/feedback/SkeletonBlock";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="auth-modal rounded-2xl border border-border bg-surface p-2 shadow-popover w-full max-w-md">
        <div className="border-b border-border-light px-6 py-5 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground" />

          <div className="mt-3">
            <SkeletonBlock
              className="mx-auto w-40 border-0 bg-transparent p-0 shadow-none"
              lines={1}
            />
            <SkeletonBlock
              className="mx-auto w-56 border-0 bg-transparent p-0 shadow-none mt-3"
              lines={1}
            />
          </div>

          <p className="sr-only">Loading sign-in</p>
        </div>

        <div className="px-4 pb-5 pt-4">
          <div className="space-y-4">
            {/* Social sign-in skeleton (button) */}
            <SkeletonBlock
              className="w-full border-0 bg-transparent p-0 shadow-none"
              lines={1}
            />

            {/* Divider with 'or' */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border-light" />
              <div className="text-xs text-text-muted">or</div>
              <div className="flex-1 border-t border-border-light" />
            </div>

            {/* Email input skeleton */}
            <SkeletonBlock
              className="w-full border-0 bg-transparent p-0 shadow-none"
              lines={1}
            />

            {/* Continue button skeleton */}
            <SkeletonBlock
              className="w-full border-0 bg-transparent p-0 shadow-none"
              lines={1}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
