import {
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Keep Your Formatting",
    description:
      "We preserve your headings, lists, tables, and layout as much as possible.",
    Icon: ShieldCheck,
    iconClassName: "bg-success-muted text-success",
  },
  {
    title: "AI You Can Trust",
    description:
      "Preview every suggestion. You stay in control of what gets applied.",
    Icon: Sparkles,
    iconClassName: "bg-ai-muted text-ai",
  },
  {
    title: "Version Everything",
    description:
      "Every change is saved. Go back anytime, stress-free.",
    Icon: RotateCcw,
    iconClassName: "bg-info-muted text-info",
  },
  {
    title: "Export Anywhere",
    description:
      "PDF, DOCX, Markdown, HTML, and more. You are always ready.",
    Icon: ClipboardCheck,
    iconClassName: "bg-warning-muted text-warning",
  },
];

export function Features() {
  return (
    <section className="px-4 pb-16 pt-12">
      <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft md:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, ...feature }) => (
          <article
            key={feature.title}
            className="flex items-center gap-4 border-b border-border-light p-5 last:border-b-0 md:[&:nth-child(n+3)]:border-b-0 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-full ${feature.iconClassName}`}
            >
              <Icon className="size-7" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-5 text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-1 text-xs leading-4 text-text-secondary">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
