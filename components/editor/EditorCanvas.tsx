"use client";

import { useState } from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import { Minus, Plus, ScanLine } from "lucide-react";

type EditorCanvasProps = {
  editor: Editor | null;
  wordCount: number;
  characterCount: number;
};

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;
const zoomScaleClasses: Record<number, string> = {
  50: "scale-[0.5]",
  60: "scale-[0.6]",
  70: "scale-[0.7]",
  80: "scale-[0.8]",
  90: "scale-[0.9]",
  100: "scale-100",
  110: "scale-[1.1]",
  120: "scale-[1.2]",
  130: "scale-[1.3]",
  140: "scale-[1.4]",
  150: "scale-150",
  160: "scale-[1.6]",
  170: "scale-[1.7]",
  180: "scale-[1.8]",
  190: "scale-[1.9]",
  200: "scale-200",
};

export function EditorCanvas({
  editor,
  wordCount,
  characterCount,
}: EditorCanvasProps) {
  const [zoom, setZoom] = useState(100);

  const zoomOut = () =>
    setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
  const zoomIn = () =>
    setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
  const resetZoom = () => setZoom(100);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft">
      <div
        role="region"
        aria-label="Document editor content"
        tabIndex={0}
        className="min-h-0 flex-1 touch-pan-y overflow-y-scroll overscroll-contain bg-surface-secondary"
      >
        <div
          className={`document-editor min-h-[320px] w-full origin-top bg-surface px-5 py-5 transition-transform md:min-h-[480px] md:px-7 md:py-6 xl:min-h-0 ${zoomScaleClasses[zoom]}`}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border-light px-5 py-2.5 text-xs text-text-muted">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            <span className="font-semibold text-text-secondary">
              {wordCount.toLocaleString()}
            </span>{" "}
            words
          </span>
          <span>
            <span className="font-semibold text-text-secondary">
              {characterCount.toLocaleString()}
            </span>{" "}
            characters
          </span>
          <span>English (US)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-center font-medium text-text-secondary">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
            title="Zoom out"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-40"
            title="Zoom in"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="flex size-7 items-center justify-center rounded-md text-text-secondary transition hover:bg-surface-secondary"
            title="Reset zoom"
          >
            <ScanLine className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
