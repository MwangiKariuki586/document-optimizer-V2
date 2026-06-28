import {
  BriefcaseBusiness,
  FileCheck2,
  GraduationCap,
  PenLine,
} from "lucide-react";

const useCases = [
  {
    title: "Resumes and cover letters",
    description:
      "Strengthen wording, clarity, and role-fit while keeping the final document reviewable.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Reports and proposals",
    description:
      "Improve structure, executive summaries, and readability before sharing business documents.",
    Icon: FileCheck2,
  },
  {
    title: "Academic writing",
    description:
      "Simplify dense sentences, polish tone, and preserve the user's own document structure.",
    Icon: GraduationCap,
  },
  {
    title: "Drafts and long-form writing",
    description:
      "Turn rough text into cleaner, export-ready content with controlled AI suggestions.",
    Icon: PenLine,
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-4 pt-12">
      <div className="mx-auto max-w-[1200px] border-t border-border-light pt-12">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-normal text-accent">
            Use cases
          </p>
          <h2 className="mx-auto mt-5 max-w-4xl text-[28px] font-bold leading-9 text-text-primary md:text-[34px] md:leading-[44px]">
            Built for documents people actually need to trust.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
            The workflow fits high-stakes documents where users need better
            writing, visible changes, and a clean export path.
          </p>
        </div>

        <div className="mt-10 grid gap-0 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map(({ Icon, ...useCase }) => (
            <article
              key={useCase.title}
              className="border-border-light py-5 md:px-8 lg:min-h-[210px] lg:border-r lg:last:border-r-0"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-accent-lighter text-accent">
                <Icon className="size-6" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-base font-bold leading-6 text-text-primary">
                {useCase.title}
              </h3>
              <p className="mt-5 text-sm leading-6 text-text-secondary">
                {useCase.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
