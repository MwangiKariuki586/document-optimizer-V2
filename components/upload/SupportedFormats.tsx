// Server component — no interactivity needed

type Format = {
  label: string;
  ext: string;
  /** Tailwind token classes for the icon tile */
  iconBg: string;
  iconText: string;
  /** Short SVG letter shown inside the icon tile */
  letter: string;
};

const FORMATS: Format[] = [
  {
    label: "PDF",
    ext: ".pdf",
    iconBg: "bg-error-muted",
    iconText: "text-error-foreground",
    letter: "P",
  },
  {
    label: "Word Document",
    ext: ".docx",
    iconBg: "bg-info-muted",
    iconText: "text-info-foreground",
    letter: "W",
  },
  {
    label: "Text File",
    ext: ".txt",
    iconBg: "bg-surface-tertiary",
    iconText: "text-text-secondary",
    letter: "T",
  },
  {
    label: "Markdown",
    ext: ".md",
    iconBg: "bg-accent-light",
    iconText: "text-accent",
    letter: "M",
  },
];

export function SupportedFormats() {
  return (
    <aside
      className="rounded-2xl border border-border bg-surface p-5 shadow-card-soft"
      aria-label="Supported file formats"
    >
      <h2 className="text-sm font-semibold leading-5 text-text-primary">
        Supported Formats
      </h2>

      <ul className="mt-4 divide-y divide-border-light" role="list">
        {FORMATS.map(({ label, ext, iconBg, iconText, letter }) => (
          <li key={ext} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            {/* Colored file-type icon tile */}
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${iconBg} ${iconText}`}
              aria-hidden="true"
            >
              {letter}
            </span>

            {/* Label and extension */}
            <span className="min-w-0 flex-1 text-sm text-text-primary">{label}</span>
            <span className="shrink-0 font-mono text-xs text-text-muted">{ext}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
