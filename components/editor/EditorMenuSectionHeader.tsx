"use client";

import type { ReactNode } from "react";

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
