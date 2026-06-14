"use client";

import { useState, useRef, useCallback, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { CometSpinner } from "@/components/loading-ui/comet-spinner";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_LABEL,
  validateUpload,
} from "@/lib/documents/upload.validators";
import { appToast } from "@/lib/feedback/toast";

type CreateUploadResponse = {
  success: boolean;
  data?: { id: string; title: string; warnings: string[] };
  error?: string;
};

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      const validation = validateUpload({ name: file.name, size: file.size });

      if (!validation.ok) {
        setError(validation.error);
        appToast.error(validation.error);
        return;
      }

      setFileName(file.name);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as CreateUploadResponse;

        if (!response.ok || !result.success || !result.data) {
          const message = result.error ?? "Could not upload the document.";
          setError(message);
          appToast.error(message);
          setIsUploading(false);
          return;
        }

        appToast.success("Document uploaded.");
        if (result.data.warnings.length > 0) {
          appToast.warning(result.data.warnings[0]);
        }

        router.push(`/documents/${result.data.id}`);
      } catch (uploadError) {
        console.error("[upload/create]", uploadError);
        const message = "Something went wrong. Please try again.";
        setError(message);
        appToast.error(message);
        setIsUploading(false);
      }
    },
    [router],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [isUploading, uploadFile],
  );

  const handleChooseFile = () => {
    if (!isUploading) inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        id="upload-dropzone"
        role="button"
        tabIndex={0}
        aria-label="File drop zone — drag and drop your file here or choose a file"
        aria-busy={isUploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleChooseFile();
        }}
        className={[
          "flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isUploading
            ? "border-accent bg-accent-lighter"
            : isDragging
              ? "border-accent bg-accent-lighter"
              : "border-accent-light/50 bg-[#F8F9FF] hover:border-accent hover:bg-accent-lighter",
        ].join(" ")}
      >
        {isUploading ? (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-white text-accent shadow-sm">
              <CometSpinner className="size-8" />
            </span>
            <p className="mt-2 text-lg font-bold text-text-primary">
              Uploading &amp; analyzing…
            </p>
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <FileText className="size-4" aria-hidden="true" />
              {fileName}
            </p>
            <p className="text-xs text-text-muted">
              Extracting text and preparing your document.
            </p>
          </>
        ) : (
          <>
            <span
              className={[
                "flex size-16 items-center justify-center rounded-full transition-colors",
                isDragging
                  ? "bg-accent text-white"
                  : "bg-white text-accent shadow-sm",
              ].join(" ")}
              aria-hidden="true"
            >
              <Upload className="size-8 stroke-[2.5]" />
            </span>

            <p className="mt-2 text-lg font-bold text-text-primary">
              Drag &amp; drop your file here
            </p>
            <p className="text-sm text-text-muted">or</p>

            <button
              id="upload-choose-file-btn"
              type="button"
              onClick={handleChooseFile}
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
            >
              Choose File
            </button>

            <p className="mt-2 text-xs text-text-secondary">
              Supports PDF, DOCX, TXT, MD up to {MAX_UPLOAD_LABEL}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void uploadFile(file);
            }
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <InlineAlert title="Upload failed" variant="error">
          <span className="flex items-center justify-between gap-3">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="text-text-muted transition hover:text-text-primary"
            >
              <X className="size-4" />
            </button>
          </span>
        </InlineAlert>
      ) : null}
    </div>
  );
}
