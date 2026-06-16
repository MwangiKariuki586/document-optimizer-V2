import { CheckCircle2 } from "lucide-react";

import type {
  ExportFormat,
  ExportFormatOption,
} from "@/components/export/export.types";

type ExportFormatCardProps = {
  format: ExportFormatOption;
  selectedFormat: ExportFormat;
  onSelect: (format: ExportFormat) => void;
};

export function ExportFormatCard({
  format,
  selectedFormat,
  onSelect,
}: ExportFormatCardProps) {
  const Icon = format.icon;
  const isSelected = selectedFormat === format.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(format.id)}
      className={`relative flex min-h-[164px] min-w-0 flex-col rounded-xl border p-4 text-left shadow-card-soft transition hover:border-border-strong hover:shadow-card ${
        isSelected
          ? "border-accent bg-accent-muted"
          : "border-border bg-surface"
      }`}
      aria-pressed={isSelected}
    >
      {isSelected ? (
        <CheckCircle2 className="absolute right-3 top-3 size-4 text-accent" />
      ) : null}
      <span
        className={`flex size-9 items-center justify-center rounded-lg ${format.iconClassName}`}
      >
        <Icon className="size-5" />
      </span>
      <span className="mt-4 text-sm font-semibold text-text-primary">
        {format.label}
      </span>
      <span className="mt-1 text-xs font-medium text-text-muted">
        {format.extension}
      </span>
      <span className="mt-3 text-xs leading-5 text-text-secondary">
        {format.description}
      </span>
    </button>
  );
}
