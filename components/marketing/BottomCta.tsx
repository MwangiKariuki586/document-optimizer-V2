import { AuthCtaLink } from "@/components/auth/AuthCtaLink";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function BottomCta() {
  return (
    <section id="resources" className="px-4 py-12">
      <div className="mx-auto max-w-[1200px] rounded-2xl border border-border bg-surface p-8 text-center shadow-card md:p-10">
        <p className="text-sm font-medium text-accent">Document control first</p>
        <h2 className="mt-3 text-[28px] font-bold leading-9 text-text-primary md:text-[40px] md:leading-[48px]">
          Improve documents without losing version safety.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-[26px] text-text-secondary">
          Build cleaner, stronger, export-ready documents while every AI change
          stays previewed, reviewable, and reversible.
        </p>
        <AuthCtaLink
          hasClerk={hasClerk}
          className="mt-7 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-dark"
        >
          Create your first document
        </AuthCtaLink>
      </div>
    </section>
  );
}
