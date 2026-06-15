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
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card-soft xl:min-h-0 xl:flex-1">
      <div className="min-h-[320px] flex-1 overflow-y-auto bg-surface-secondary px-4 py-4 xl:min-h-0">
        <div
          className="document-editor mx-auto min-h-[320px] w-full max-w-[720px] origin-top rounded-lg border border-border-light bg-surface px-6 py-7 shadow-card-soft transition-transform md:min-h-[480px] md:px-10 md:py-9 xl:min-h-0"
          // Zoom is a dynamic scale factor and cannot be a static token class.
          style={{ transform: `scale(${zoom / 100})` }}
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
