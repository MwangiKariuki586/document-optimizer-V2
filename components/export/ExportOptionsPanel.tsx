import { ChevronDown, Info } from "lucide-react";

import type {
  ExportOptionKey,
  ExportOptionsState,
} from "@/components/export/export.types";

type ToggleOption = {
  key: ExportOptionKey;
  label: string;
  description: string;
};

type SelectOption = {
  key: "imageQuality" | "pageSize" | "margins" | "watermark";
  label: string;
  options: string[];
};

type ExportOptionsPanelProps = {
  options: ExportOptionsState;
  onToggle: (key: ExportOptionKey) => void;
  onSelect: (
    key: "imageQuality" | "pageSize" | "margins" | "watermark",
    value: string,
  ) => void;
};

const toggleOptions: ToggleOption[] = [
  {
    key: "includeAiImprovements",
    label: "Include AI improvements",
    description: "Export the document with accepted improvements applied.",
  },
  {
    key: "includeTrackChanges",
    label: "Include track changes",
    description: "Show edits and suggestions as tracked changes.",
  },
  {
    key: "addSummary",
    label: "Add AI summary",
    description: "Include a short generated summary at the beginning.",
  },
  {
    key: "addMetadata",
    label: "Add metadata",
    description: "Include document metadata and optimization details.",
  },
];

const selectOptions: SelectOption[] = [
  {
    key: "imageQuality",
    label: "Image quality",
    options: ["High (300 DPI)", "Medium (150 DPI)", "Web optimized"],
  },
  {
    key: "pageSize",
    label: "Page size",
    options: ["A4 (210 x 297 mm)", "Letter (8.5 x 11 in)", "Legal"],
  },
  {
    key: "margins",
    label: "Margins",
    options: ["Standard (1 inch)", "Narrow", "Wide"],
  },
  {
    key: "watermark",
    label: "Watermark",
    options: ["None", "Draft", "Confidential"],
  },
];

export function ExportOptionsPanel({
  options,
  onToggle,
  onSelect,
}: ExportOptionsPanelProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card-soft">
      <h2 className="text-sm font-semibold text-text-primary">
        2. Export Options
      </h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.9fr)]">
        <div className="space-y-3">
          {toggleOptions.map((option) => {
            const isChecked = options[option.key];

            return (
              <div
                key={option.key}
                className="flex items-center justify-between gap-4 rounded-lg border border-border-light bg-surface-secondary px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-text-primary">
                      {option.label}
                    </p>
                    <Info className="size-3.5 text-text-muted" />
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                    {option.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(option.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    isChecked ? "bg-accent" : "bg-surface-tertiary"
                  }`}
                  aria-pressed={isChecked}
                  aria-label={option.label}
                >
                  <span
                    className={`absolute top-1 size-4 rounded-full bg-surface shadow-card-soft transition ${
                      isChecked ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid content-start gap-3 border-border-light lg:border-l lg:pl-4">
          {selectOptions.map((option) => (
            <label key={option.key} className="block">
              <span className="text-sm font-semibold text-text-primary">
                {option.label}
              </span>
              <span className="relative mt-1 block">
                <select
                  value={options[option.key]}
                  onChange={(event) => onSelect(option.key, event.target.value)}
                  className="h-10 w-full appearance-none rounded-md border border-border bg-surface py-2 pl-3 pr-9 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {option.options.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
