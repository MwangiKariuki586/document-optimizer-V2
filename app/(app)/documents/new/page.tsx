import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { UploadTabs } from "@/components/upload/UploadTabs";
import { SupportedFormats } from "@/components/upload/SupportedFormats";
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

      {/* Main content grid: tabs (left) + sidebar (right) */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* UploadTabs — Upload / Create Blank / Paste Text */}
        <UploadTabs />

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <SupportedFormats />
          <WhatHappensNext />
        </aside>
      </div>

      {/* Tips section */}
      <UploadTips />

      {/* Footer note */}
      <p className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
        Your original files are always preserved and secure.
      </p>
    </PageShell>
  );
}
