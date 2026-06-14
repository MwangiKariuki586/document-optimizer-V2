"use client";

import type { ReactNode } from "react";

type EditorMenuBackdropProps = {
  onClose: () => void;
};

export function EditorMenuBackdrop({ onClose }: EditorMenuBackdropProps) {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      className="fixed inset-0 z-40 cursor-default"
      onClick={onClose}
    />
  );
}

type EditorMenuPanelProps = {
  children: ReactNode;
  className?: string;
};

export function EditorMenuPanel({
  children,
  className = "",
}: EditorMenuPanelProps) {
  return (
    <div
      role="menu"
      className={`absolute right-0 z-50 mt-2 min-w-[14rem] rounded-xl border border-border bg-surface p-1.5 shadow-popover ${className}`}
    >
      {children}
    </div>
  );
}

type EditorMenuSectionHeaderProps = {
  children: ReactNode;
};

export function EditorMenuSectionHeader({
  children,
}: EditorMenuSectionHeaderProps) {
  return (
    <p className="px-2.5 py-1.5 text-xs font-medium text-text-muted">
      {children}
    </p>
  );
}

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

type EditorMenuFooterProps = {
  children: ReactNode;
};

export function EditorMenuFooter({ children }: EditorMenuFooterProps) {
  return (
    <p className="border-t border-border-light px-2.5 py-2 text-xs text-text-muted">
      {children}
    </p>
  );
}
