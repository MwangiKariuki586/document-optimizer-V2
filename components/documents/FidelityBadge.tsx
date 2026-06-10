export type FidelityStatus =
  | "Structure Preserved"
  | "Original Preserved"
  | "Limited Formatting"
  | "Plain Text Only"
  | "Formatting Review Needed";

type FidelityBadgeProps = {
  status: FidelityStatus;
};

const fidelityClasses: Record<FidelityStatus, string> = {
  "Structure Preserved": "bg-success-muted text-success-foreground",
  "Original Preserved": "bg-info-muted text-info-foreground",
  "Limited Formatting": "bg-warning-muted text-warning-foreground",
  "Plain Text Only": "bg-surface-tertiary text-text-muted",
  "Formatting Review Needed": "bg-ai-muted text-ai-dark",
};

export function FidelityBadge({ status }: FidelityBadgeProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${fidelityClasses[status]}`}
    >
      {status}
    </span>
  );
}
