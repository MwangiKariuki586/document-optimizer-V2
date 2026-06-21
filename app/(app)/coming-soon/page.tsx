import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Coming Soon — Document Optimizer",
  description: "Preview features that are planned for Document Optimizer.",
};

const featureTitles: Record<string, string> = {
  "account-settings": "Account settings",
  "download-usage-report": "Usage reports",
  "manage-storage": "Storage management",
  "readiness-insights": "Readiness insights",
  "recent-activity": "Complete activity history",
  "usage-breakdown": "Detailed usage breakdown",
};

type ComingSoonPageProps = {
  searchParams: Promise<{ feature?: string }>;
};

export default async function ComingSoonPage({
  searchParams,
}: ComingSoonPageProps) {
  const { feature } = await searchParams;
  const featureTitle = feature ? featureTitles[feature] : undefined;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Product roadmap"
        title={featureTitle ?? "Coming soon"}
        description="This feature is planned, but it is not available in the current workspace yet."
      />

      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
        <div className="max-w-lg text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-lighter text-accent">
            <Clock3 className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-normal text-accent">
            Coming soon
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-8 text-text-primary">
            We&apos;re still building this experience.
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            You can continue using the available document, AI, version, export,
            and usage tools while this feature is being prepared.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
