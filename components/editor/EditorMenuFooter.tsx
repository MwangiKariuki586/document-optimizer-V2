"use client";

import type { ReactNode } from "react";

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
