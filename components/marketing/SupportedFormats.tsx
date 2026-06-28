import { FileText, FileType, FileUp, ShieldAlert } from "lucide-react";

const formats = [
  {
    name: "DOCX",
    detail: "Best for preserving headings, lists, tables, links, and editable structure.",
    status: "Structure preserved where possible",
    statusClassName: "bg-success-muted text-success-foreground",
    Icon: FileType,
  },
  {
    name: "PDF",
    detail: "Original file stays preserved. Editable formatting may be limited for complex layouts.",
    status: "Clear formatting warning",
    statusClassName: "bg-warning-muted text-warning-foreground",
    Icon: ShieldAlert,
  },
  {
    name: "Markdown",
    detail: "Imports structured text cleanly and keeps portable document content ready for AI.",
    status: "Structured text support",
    statusClassName: "bg-success-muted text-success-foreground",
    Icon: FileText,
  },
  {
    name: "TXT",
    detail: "Fast plain-text document creation for drafts, notes, and simple writing workflows.",
    status: "Plain text only",
    statusClassName: "bg-info-muted text-info-foreground",
    Icon: FileUp,
  },
];

export function SupportedFormats() {
  return (
    <section id="supported-formats" className="px-4 pt-12">
      <div className="mx-auto grid max-w-[1200px] gap-10 border-t border-border-light pt-12 lg:grid-cols-[0.72fr_1fr] lg:items-center lg:gap-14">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-normal text-accent">
            Supported formats
          </p>
          <h2 className="mt-5 text-[34px] font-bold leading-[42px] text-text-primary md:text-[44px] md:leading-[54px]">
            Clear expectations before upload.
          </h2>
          <p className="mt-8 text-base leading-8 text-text-secondary">
            Users can bring common document formats and see honest fidelity
            guidance when a file cannot be reconstructed perfectly for editing.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
          {formats.map(({ Icon, ...format }) => (
            <article
              key={format.name}
              className="grid gap-4 border-b border-border-light p-4 last:border-b-0 md:grid-cols-[64px_92px_minmax(0,1fr)_160px] md:items-center md:px-5 md:py-4"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-surface-tertiary text-accent">
                <Icon className="size-6" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-bold leading-7 text-text-primary">
                {format.name}
              </h3>
              <p className="text-sm leading-5 text-text-secondary">
                {format.detail}
              </p>
              <span
                className={`rounded-xl px-3 py-2 text-center text-xs font-semibold leading-4 ${format.statusClassName}`}
              >
                {format.status}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
