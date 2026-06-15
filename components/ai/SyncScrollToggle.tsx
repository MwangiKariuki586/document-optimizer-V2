import { Link2, Link2Off } from "lucide-react";

type SyncScrollToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function SyncScrollToggle({
  enabled,
  onChange,
}: SyncScrollToggleProps) {
  const Icon = enabled ? Link2 : Link2Off;

  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        enabled
          ? "border-accent bg-accent-light text-accent"
          : "border-border bg-surface text-text-secondary hover:bg-surface-secondary"
      }`}
      aria-pressed={enabled}
    >
      <Icon className="size-3.5" />
      Sync scrolling: {enabled ? "On" : "Off"}
    </button>
  );
}
