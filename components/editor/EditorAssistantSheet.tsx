"use client";

import { useEffect, useRef } from "react";
import { Sparkles, X } from "lucide-react";

type EditorAssistantSheetProps = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

export function EditorAssistantSheet({ children, open, onClose }: EditorAssistantSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] xl:hidden">
      <button type="button" className="absolute inset-0 bg-overlay-muted" aria-label="Close AI assistant" onClick={onClose} />
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="editor-assistant-title" className="absolute inset-x-0 bottom-0 flex h-[88dvh] min-w-0 flex-col overflow-hidden rounded-t-xl border border-border bg-surface shadow-popover md:inset-x-5 md:bottom-5 md:mx-auto md:h-[min(88dvh,720px)] md:max-w-2xl md:rounded-xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light px-4 py-3">
          <h2 id="editor-assistant-title" className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Sparkles className="size-4 text-accent" />
            AI Assistant
          </h2>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="inline-flex size-9 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary" aria-label="Close AI assistant" title="Close AI assistant">
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-3">{children}</div>
      </section>
    </div>
  );
}
