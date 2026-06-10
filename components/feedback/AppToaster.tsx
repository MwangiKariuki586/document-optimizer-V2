"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-surface text-text-primary shadow-popover",
          description: "text-text-secondary",
          actionButton: "bg-accent text-accent-foreground",
          cancelButton: "bg-surface-secondary text-text-primary",
        },
      }}
    />
  );
}
