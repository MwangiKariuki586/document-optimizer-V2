import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { UploadTabs } from "@/components/upload/UploadTabs";
import { WhatHappensNext } from "@/components/upload/WhatHappensNext";
import { UploadTips } from "@/components/upload/UploadTips";

export const metadata = {
  title: "Upload / Create Document — Document Optimizer",
  description:
    "Upload an existing file, start from scratch, or paste your text to get started.",
};

export default function NewDocumentPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Create"
        title="Upload / Create Document"
        description="Upload an existing file, start from scratch, or paste your text to get started. We'll help you improve it with AI."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Suspense
          fallback={
            <div className="min-h-[360px] rounded-2xl border border-border bg-surface shadow-card-soft" />
          }
        >
          <UploadTabs />
        </Suspense>
        <aside className="flex flex-col gap-4 lg:self-start">
          <UploadTips />
          <WhatHappensNext />
        </aside>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
        Your original files are always preserved and secure.
      </p>
    </PageShell>
  );
}
