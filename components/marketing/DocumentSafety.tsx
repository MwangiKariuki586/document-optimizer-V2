import { Eye, FileLock2, History, ShieldCheck } from "lucide-react";

const safetyItems = [
  {
    title: "Preview before apply",
    description:
      "AI output appears as suggestions or a comparison preview before it can change the saved document.",
    Icon: Eye,
  },
  {
    title: "Original files preserved",
    description:
      "Uploaded source files stay private and preserved, even when editable extraction has formatting limits.",
    Icon: FileLock2,
  },
  {
    title: "Version-safe edits",
    description:
      "Important document changes create recoverable versions so users can return to earlier work.",
    Icon: History,
  },
  {
    title: "Private by design",
    description:
      "Document and export files are stored privately, with owner-scoped access and signed downloads.",
    Icon: ShieldCheck,
  },
];

export function DocumentSafety() {
  return (
    <section id="document-safety" className="px-4 pt-16">
      <div className="mx-auto grid max-w-[1200px] gap-10 border-t border-border-light pt-16 lg:grid-cols-[0.72fr_1fr] lg:gap-14">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-normal text-accent">
            Document safety
          </p>
          <h2 className="mt-5 text-[34px] font-bold leading-[42px] text-text-primary md:text-[44px] md:leading-[54px]">
            AI help without silent document changes.
          </h2>
          <p className="mt-8 text-base leading-8 text-text-secondary">
            Document Optimizer is built around user control: every AI change is
            visible before it matters, and every major edit has a recovery path.
          </p>
        </div>

        <div className="grid border-border-light md:grid-cols-2 md:border-l">
          {safetyItems.map(({ Icon, ...item }, index) => (
            <article
              key={item.title}
              className={`border-border-light py-7 md:border-r md:px-9 md:py-9 lg:min-h-[210px] ${
                index < 2 ? "md:border-b" : ""
              }`}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-lighter text-accent">
                <Icon className="size-6" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-base font-bold leading-6 text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
