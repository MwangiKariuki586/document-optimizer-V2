import { CloudUpload, Download, FileSearch, WandSparkles } from "lucide-react";

const steps = [
  {
    label: "01",
    title: "Upload or Create",
    description: "Upload your document or create a new one in seconds.",
    Icon: CloudUpload,
  },
  {
    label: "02",
    title: "Analyze and Understand",
    description: "AI evaluates clarity, tone, structure, and formatting.",
    Icon: FileSearch,
  },
  {
    label: "03",
    title: "Get Suggestions",
    description: "Review AI suggestions and improvements you control.",
    Icon: WandSparkles,
  },
  {
    label: "04",
    title: "Apply and Export",
    description: "Apply changes safely, save versions, and export with ease.",
    Icon: Download,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 pb-4 pt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold leading-8 text-text-primary">
            Improve Documents in <span className="text-accent">4 Simple Steps</span>
          </h2>
        </div>
        <div className="relative mt-7 grid gap-8 md:grid-cols-4 md:gap-6">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t border-dashed border-border-strong md:block" />
          {steps.map(({ Icon, ...step }) => (
            <article key={step.label} className="relative text-center">
              <div className="relative z-10 mx-auto flex size-16 items-center justify-center rounded-full border border-border-light bg-accent-lighter text-accent shadow-card-soft">
                <Icon className="size-8" strokeWidth={1.8} />
              </div>
              <div className="relative z-10 mx-auto -mt-2 flex size-5 items-center justify-center rounded-full bg-surface text-[11px] font-bold text-accent shadow-card-soft">
                {step.label.replace("0", "")}
              </div>
              <h3 className="mt-3 text-sm font-bold leading-5 text-text-primary">
                {step.title}
              </h3>
              <p className="mx-auto mt-1 max-w-[180px] text-xs leading-4 text-text-secondary">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
