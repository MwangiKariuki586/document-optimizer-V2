export type DocumentStatus =
  | "Ready"
  | "Draft"
  | "Processing"
  | "Failed"
  | "Archived";

type DocumentStatusBadgeProps = {
  status: DocumentStatus;
};

const statusClasses: Record<DocumentStatus, string> = {
  Ready: "bg-success-muted text-success-foreground",
  Draft: "bg-surface-tertiary text-text-secondary",
  Processing: "bg-ai-muted text-ai-dark",
  Failed: "bg-error-muted text-error-foreground",
  Archived: "bg-surface-secondary text-text-muted",
};

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
