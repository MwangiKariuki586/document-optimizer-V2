"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DATE_RANGE_OPTIONS,
  type DateRangeOption,
} from "@/lib/date-range";

type DateRangeSelectProps = {
  ariaLabel: string;
  onChange: (range: DateRangeOption) => void;
  options?: readonly DateRangeOption[];
  value: DateRangeOption;
};

export function DateRangeSelect({
  ariaLabel,
  onChange,
  options = DATE_RANGE_OPTIONS,
  value,
}: DateRangeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-10 min-w-[132px] items-center justify-between gap-3 rounded-xl border bg-surface py-2 pl-4 pr-3 text-sm font-medium text-text-primary outline-none transition hover:bg-surface-secondary focus:border-accent focus:ring-2 focus:ring-accent ${
          isOpen ? "border-accent ring-2 ring-accent" : "border-border"
        }`}
      >
        {value}
        <ChevronDown
          className={`size-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-50 min-w-full overflow-hidden rounded-md border border-border bg-surface p-1 shadow-popover"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={value === option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full rounded-sm px-3 py-2 text-left text-sm font-medium text-text-primary transition hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none ${
                value === option ? "bg-accent-lighter" : "bg-surface"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
