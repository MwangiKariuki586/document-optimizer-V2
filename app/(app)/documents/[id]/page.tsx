import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function DocumentPlaceholderPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Document"
        title="Document workspace"
        description="Placeholder route for document detail navigation. The full editor workspace is scheduled for Phase 4."
        actions={
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        }
      />
      <EmptyState
        icon={<FileText className="size-6" />}
        title="Editor workspace comes later."
        description="This route exists so shell and dashboard navigation can be verified before the full editor UI is built."
      />
    </PageShell>
  );
}
