"use client";

import type { ReactNode } from "react";

type EditorMenuItemProps = {
  label: string;
  description?: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export function EditorMenuItem({
  label,
  description,
  icon,
  onClick,
  disabled = false,
}: EditorMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="mt-0.5 shrink-0 text-text-secondary">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text-primary">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-text-muted">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
