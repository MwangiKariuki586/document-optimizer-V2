"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { PageShell } from "@/components/layout/PageShell";

type AppErrorProps = {
  reset: () => void;
};

export default function AppError({ reset }: AppErrorProps) {
  return (
    <PageShell>
      <ErrorState
        title="We could not load this workspace."
        description="Try refreshing the page. If this keeps happening, return to the dashboard and try again."
        action={
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
            onClick={reset}
          >
            Try again
          </button>
        }
      />
    </PageShell>
  );
}
