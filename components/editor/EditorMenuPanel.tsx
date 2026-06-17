"use client";

import type { ReactNode } from "react";

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
