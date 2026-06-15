export type PreviewMode = "side-by-side" | "proposed-only";

type PreviewModeToggleProps = {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
};

const modes: Array<{ value: PreviewMode; label: string }> = [
  { value: "side-by-side", label: "Side-by-side" },
  { value: "proposed-only", label: "Proposed only" },
];

export function PreviewModeToggle({ value, onChange }: PreviewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface p-1"
      aria-label="Preview view mode"
    >
      {modes.map((mode) => (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            value === mode.value
              ? "bg-accent-light text-accent"
              : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
          }`}
          aria-pressed={value === mode.value}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
