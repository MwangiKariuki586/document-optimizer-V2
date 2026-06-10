import { Check } from "lucide-react";
import { AuthCtaLink } from "@/components/auth/AuthCtaLink";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const proofPoints = [
  "Preserve formatting",
  "AI suggestions you control",
  "Version-safe edits",
  "Secure and private",
];

export function Hero() {
  return (
    <section className="px-4 pb-10 pt-16 md:pb-12 md:pt-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <div className="mb-5 rounded-full bg-accent-lighter px-4 py-2 text-sm font-medium text-accent">
          + AI-powered document improvement +
        </div>
        <h1 className="max-w-4xl text-[34px] font-bold leading-[42px] text-text-primary md:text-[42px] md:leading-[52px] lg:text-[64px] lg:leading-[72px]">
          Make Every Document{" "}
          <span className="text-accent">Clearer, Stronger, Better</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-[26px] text-text-secondary md:text-lg md:leading-8">
          Analyze, improve, and polish your documents with AI without losing
          your formatting or control. Work smarter, not harder.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-4">
          {proofPoints.map((point) => (
            <span
              key={point}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {point}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <AuthCtaLink
            hasClerk={hasClerk}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-card transition hover:bg-accent-dark"
          >
            Start improving your documents -&gt;
          </AuthCtaLink>
          <p className="text-sm text-text-muted">
            No credit card required. Start for free.
          </p>
        </div>
      </div>
    </section>
  );
}
