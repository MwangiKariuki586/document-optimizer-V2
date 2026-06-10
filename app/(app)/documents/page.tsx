import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export default function DocumentsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        description="A lightweight shell placeholder for document list navigation. The full document dashboard UI is scheduled for Phase 2."
        actions={
          <Link
            href="/documents/new"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
          >
            <Plus className="size-4" />
            New Document
          </Link>
        }
      />
      <EmptyState
        icon={<FileText className="size-6" />}
        title="Document list coming next."
        description="The app shell navigation is active now. Full document listing, filters, empty states, and real data arrive in the dashboard phase."
      />
    </PageShell>
  );
}
