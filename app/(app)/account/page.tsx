import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

const usage = [
  { label: "Documents created", value: "12" },
  { label: "AI actions used", value: "48" },
  { label: "Exports generated", value: "9" },
];

export default function AccountPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Account"
        title="Account and usage"
        description="Account shell placeholder with usage summary. Real Clerk profile and usage data are scheduled for Phase 9."
      />
      <section
        id="usage"
        className="grid gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card-soft md:grid-cols-3"
      >
        {usage.map((item) => (
          <article key={item.label}>
            <p className="text-3xl font-bold leading-[38px] text-text-primary">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-text-muted">{item.label}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
