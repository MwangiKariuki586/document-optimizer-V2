import {
  formatVersionDate,
  sourceLabel,
  type PreviewRecord,
} from "@/lib/versions/version-history.utils";

function MarkdownPreview({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");

  if (markdown.trim().length === 0) {
    return (
      <p className="rounded-lg border border-border-light bg-surface-secondary p-4 text-sm text-text-muted">
        No saved content in this version.
      </p>
    );
  }

  return (
    <article className="document-editor w-full text-sm leading-6 text-text-primary">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (trimmed.length === 0) {
          return <br key={`blank-${index}`} />;
        }

        if (trimmed.startsWith("### ")) {
          return <h3 key={index}>{trimmed.slice(4)}</h3>;
        }

        if (trimmed.startsWith("## ")) {
          return <h2 key={index}>{trimmed.slice(3)}</h2>;
        }

        if (trimmed.startsWith("# ")) {
          return <h1 key={index}>{trimmed.slice(2)}</h1>;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <ul key={index}>
              <li>{trimmed.slice(2)}</li>
            </ul>
          );
        }

        return <p key={index}>{trimmed}</p>;
      })}
    </article>
  );
}

type VersionPreviewPaneProps = {
  label: string;
  version: PreviewRecord;
  currentVersionNumber: number;
  compact?: boolean;
};

export function VersionPreviewPane({
  label,
  version,
  currentVersionNumber,
  compact = false,
}: VersionPreviewPaneProps) {
  const isCurrent = version.versionNumber === currentVersionNumber;
  const displayLabel =
    version.source === "current" ? "Current" : sourceLabel[version.source];

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-light px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            {label}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-semibold text-accent">
              v{version.versionNumber}
            </span>
            <p
              className="truncate text-sm font-semibold text-text-primary"
              title={displayLabel}
            >
              {displayLabel}
            </p>
            {isCurrent ? (
              <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent">
                Current
              </span>
            ) : null}
          </div>
        </div>
        <p className="shrink-0 text-right text-xs text-text-muted">
          {formatVersionDate(version.createdAt)}
        </p>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto bg-surface-secondary ${
          compact ? "min-h-[280px]" : "min-h-[360px] xl:min-h-0"
        }`}
      >
        <div className="document-editor min-h-full w-full bg-surface px-5 py-5">
          <MarkdownPreview markdown={version.contentMarkdown} />
        </div>
      </div>
    </section>
  );
}
