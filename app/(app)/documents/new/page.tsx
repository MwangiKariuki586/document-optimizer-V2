import { FileUp, PenLine, Plus } from "lucide-react";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

const options = [
  {
    title: "Upload File",
    description: "Prepare PDF, DOCX, Markdown, and TXT upload states.",
    Icon: FileUp,
  },
  {
    title: "Paste Text",
    description: "Create a document from copied text or draft content.",
    Icon: PenLine,
  },
  {
    title: "Create Blank",
    description: "Start with a clean editor workspace.",
    Icon: Plus,
  },
];

export default function NewDocumentPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Create"
        title="Start a document"
        description="Mock shell entry point for the upload/create flow. Full UI states are scheduled for Phase 3."
      />
      <InlineAlert title="Upload states are being prepared" variant="info">
        This shell route confirms the creation entry point. The full upload,
        paste, blank, progress, success, and error states are scheduled for
        Phase 3.
      </InlineAlert>
      <section className="grid gap-4 md:grid-cols-3">
        {options.map(({ Icon, ...option }) => (
          <article
            key={option.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-card-soft"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent-lighter text-accent">
              <Icon className="size-6" />
            </span>
            <h2 className="mt-5 text-lg font-semibold leading-7 text-text-primary">
              {option.title}
            </h2>
            <p className="mt-2 text-sm leading-[22px] text-text-secondary">
              {option.description}
            </p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
