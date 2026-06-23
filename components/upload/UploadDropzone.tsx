"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileSearch, FileText, FolderOpen, RefreshCw, Trash2, Upload, X } from "lucide-react";
import * as tus from "tus-js-client";
import { CometSpinner } from "@/components/loading-ui/CometSpinner";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import {
  ACCEPTED_EXTENSIONS,
  MAX_UPLOAD_LABEL,
  validateUpload,
} from "@/lib/documents/upload.validators";
import { sha256File } from "@/lib/ingestion/checksum";
import type {
  ExistingDocumentSummary,
  IngestionState,
  InitializeUploadResult,
  SignedUploadTarget,
} from "@/lib/ingestion/ingestion.types";
import { appToast } from "@/lib/feedback/toast";

type ApiResponse<T> = { success: boolean; data?: T; error?: string };
type CompleteUploadResult = {
  ingestionId: string;
  status: string;
  mode?: "inline" | "queued";
};
type DuplicatePrompt = {
  ingestionId: string;
  documentId: string | null;
  existingDocument: ExistingDocumentSummary;
  file: File;
};

const PROCESSING_STAGE_COPY: Record<string, string> = {
  awaiting_upload: "Waiting for upload",
  queued: "Queued for processing",
  downloading: "Reading the original file",
  parsing: "Extracting text and document structure",
  retry_wait: "Waiting to retry",
};

async function uploadWithTus(
  file: File,
  target: SignedUploadTarget,
  onProgress: (percent: number) => void,
  onCreated: (upload: tus.Upload) => void,
) {
  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${target.storageUrl}/storage/v1/upload/resumable/sign`,
      chunkSize: 6 * 1024 * 1024,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      headers: {
        "x-signature": target.token,
      },
      metadata: {
        bucketName: target.bucket,
        objectName: target.objectKey,
        contentType: file.type || "application/octet-stream",
      },
      onError: reject,
      onProgress: (uploaded, total) => onProgress(Math.round((uploaded / total) * 100)),
      onSuccess: () => resolve(),
    });
    onCreated(upload);
    void upload.findPreviousUploads().then((previous) => {
      if (previous[0]) upload.resumeFromPreviousUpload(previous[0]);
      upload.start();
    });
  });
}

export function UploadDropzone({ initialDocumentId }: { initialDocumentId?: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeUpload = useRef<tus.Upload | null>(null);
  const idempotencyKeys = useRef(new Map<string, string>());
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "hashing" | "uploading" | "paused" | "queuing">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<DuplicatePrompt | null>(null);
  const [processing, setProcessing] = useState<IngestionState | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const readyNavigationStarted = useRef(false);

  const busy = phase !== "idle";

  const loadProcessingState = useCallback(async (documentId: string) => {
    const response = await fetch(`/api/documents/${documentId}/ingestion`, {
      cache: "no-store",
    });
    const result = (await response.json()) as ApiResponse<IngestionState>;
    if (!response.ok || !result.data) {
      throw new Error(result.error ?? "Could not load document processing.");
    }
    setProcessing(result.data);
    setFileName(result.data.originalFileName);
    if (result.data.status === "completed" && !readyNavigationStarted.current) {
      readyNavigationStarted.current = true;
      appToast.success("Document ready.");
      router.push(`/documents/${documentId}`);
    }
    return result.data;
  }, [router]);

  const monitorDocument = useCallback(async (documentId: string) => {
    setPhase("queuing");
    router.replace(
      `/documents/new?tab=upload&processingDocumentId=${encodeURIComponent(documentId)}`,
      { scroll: false },
    );
    await loadProcessingState(documentId);
    setPhase("idle");
  }, [loadProcessingState, router]);

  useEffect(() => {
    if (!initialDocumentId || processing?.documentId === initialDocumentId) return;
    const timeout = window.setTimeout(() => {
      void loadProcessingState(initialDocumentId).catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load document processing.",
        );
      });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [initialDocumentId, loadProcessingState, processing?.documentId]);

  useEffect(() => {
    const documentId = processing?.documentId;
    if (
      !documentId ||
      ["completed", "failed", "duplicate_pending", "duplicate_resolved"].includes(
        processing.status,
      )
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadProcessingState(documentId).catch(() => undefined);
    }, 2_000);

    return () => window.clearInterval(interval);
  }, [loadProcessingState, processing?.documentId, processing?.status]);

  const runDirectUpload = useCallback(async (file: File, documentId: string, target: SignedUploadTarget) => {
    setPhase("uploading");
    setProgress(0);
    await uploadWithTus(file, target, setProgress, (upload) => { activeUpload.current = upload; });
    setPhase("queuing");
    const response = await fetch(`/api/uploads/${documentId}/complete`, { method: "POST" });
    const result = (await response.json()) as ApiResponse<CompleteUploadResult>;
    if (!response.ok || !result.success) throw new Error(result.error ?? "Could not queue document processing.");
    appToast.success(
      result.data?.status === "completed"
        ? "Upload complete. Document ready."
        : "Upload complete. Processing started.",
    );
    await monitorDocument(documentId);
  }, [monitorDocument]);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);
    setDuplicate(null);
    const validation = validateUpload({ name: file.name, size: file.size });
    if (!validation.ok) {
      setError(validation.error);
      appToast.error(validation.error);
      return;
    }
    setFileName(file.name);
    setPhase("hashing");
    try {
      const checksumSha256 = await sha256File(file);
      const idempotencyKey =
        idempotencyKeys.current.get(checksumSha256) ?? crypto.randomUUID();
      idempotencyKeys.current.set(checksumSha256, idempotencyKey);
      const response = await fetch("/api/uploads/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          mimeType: file.type || validation.contentType,
          checksumSha256,
          idempotencyKey,
        }),
      });
      const result = (await response.json()) as ApiResponse<InitializeUploadResult>;
      if (!response.ok || !result.success || !result.data) throw new Error(result.error ?? "Could not initialize upload.");
      if (result.data.status === "duplicate_detected") {
        setDuplicate({
          ingestionId: result.data.ingestionId,
          documentId: result.data.documentId,
          existingDocument: result.data.existingDocument,
          file,
        });
        setPhase("idle");
        return;
      }
      if (result.data.status !== "upload_ready") {
        if (result.data.documentId) await monitorDocument(result.data.documentId);
        else throw new Error("This upload cannot be resumed.");
        return;
      }
      await runDirectUpload(file, result.data.documentId, result.data.upload);
      idempotencyKeys.current.delete(checksumSha256);
    } catch (uploadError) {
      console.error("[upload/create]", uploadError);
      const message = uploadError instanceof Error ? uploadError.message : "Something went wrong. Please try again.";
      setError(message);
      appToast.error(message);
      setPhase("idle");
    }
  }, [monitorDocument, runDirectUpload]);

  async function resolveDuplicate(action: "open_existing" | "continue_as_new") {
    if (!duplicate) return;
    setPhase("queuing");
    try {
      const response = await fetch(`/api/uploads/ingestions/${duplicate.ingestionId}/duplicate-resolution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json()) as ApiResponse<{
        status: string;
        documentId: string | null;
        upload?: SignedUploadTarget;
      }>;
      if (!response.ok || !result.success || !result.data) throw new Error(result.error ?? "Could not resolve duplicate.");
      if (action === "open_existing" && result.data.documentId) {
        router.push(`/documents/${result.data.documentId}`);
        return;
      }
      if (result.data.status === "upload_ready" && result.data.documentId && result.data.upload) {
        setDuplicate(null);
        await runDirectUpload(duplicate.file, result.data.documentId, result.data.upload);
        return;
      }
      if (result.data.documentId) router.push(`/documents/${result.data.documentId}`);
    } catch (resolutionError) {
      const message = resolutionError instanceof Error ? resolutionError.message : "Could not resolve duplicate.";
      setError(message);
      setPhase("idle");
    }
  }

  async function resolveProcessingDuplicate(
    action: "open_existing" | "continue_as_new",
  ) {
    if (!processing) return;
    setIsProcessingAction(true);
    try {
      const response = await fetch(
        `/api/uploads/ingestions/${processing.id}/duplicate-resolution`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const result = (await response.json()) as ApiResponse<{
        status: string;
        documentId: string | null;
      }>;
      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Could not resolve duplicate.");
      }
      if (action === "open_existing" && result.data.documentId) {
        router.replace(`/documents/${result.data.documentId}`);
        return;
      }
      setProcessing((current) =>
        current
          ? {
              ...current,
              status: "queued",
              stage: "queued",
              duplicateResolution: "continue_as_new",
              existingDocument: null,
            }
          : current,
      );
    } catch (resolutionError) {
      appToast.error(
        resolutionError instanceof Error
          ? resolutionError.message
          : "Could not resolve duplicate.",
      );
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function retryProcessing() {
    const documentId = processing?.documentId;
    if (!documentId) return;
    setIsProcessingAction(true);
    const response = await fetch(
      `/api/documents/${documentId}/ingestion/retry`,
      { method: "POST" },
    );
    const result = (await response.json()) as ApiResponse<unknown>;
    if (response.ok && result.success) {
      setProcessing((current) =>
        current
          ? {
              ...current,
              status: "queued",
              stage: "queued",
              errorCode: null,
              errorMessage: null,
            }
          : current,
      );
      appToast.success("Document processing queued again.");
    } else {
      appToast.error(result.error ?? "Could not retry processing.");
    }
    setIsProcessingAction(false);
  }

  async function deleteProcessing() {
    const documentId = processing?.documentId;
    if (!documentId) return;
    setIsProcessingAction(true);
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setProcessing(null);
      setFileName(null);
      readyNavigationStarted.current = false;
      router.replace("/documents/new", { scroll: false });
      appToast.success("Upload removed.");
    } else {
      appToast.error("Could not delete this document.");
    }
    setIsProcessingAction(false);
  }

  function pauseUpload() {
    void activeUpload.current?.abort();
    setPhase("paused");
    appToast.info("Upload paused.");
  }

  function resumeUpload() {
    activeUpload.current?.start();
    setPhase("uploading");
  }

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!busy && event.dataTransfer.files?.[0]) void uploadFile(event.dataTransfer.files[0]);
  }, [busy, uploadFile]);

  if (
    processing?.status === "duplicate_pending" &&
    processing.existingDocument
  ) {
    return (
      <div className="flex min-h-[240px] flex-col justify-center gap-5 rounded-xl border border-warning/40 bg-warning-light p-6">
        <div>
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="size-5" />
            <p className="text-sm font-semibold text-text-primary">
              This document already exists
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            “{processing.existingDocument.title}” has the same file content. No
            new version or usage record has been created.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isProcessingAction}
            onClick={() => void resolveProcessingDuplicate("open_existing")}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            <FolderOpen className="size-4" /> Open existing document
          </button>
          <button
            type="button"
            disabled={isProcessingAction}
            onClick={() => void resolveProcessingDuplicate("continue_as_new")}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary disabled:opacity-60"
          >
            Continue as new copy
          </button>
        </div>
      </div>
    );
  }

  if (processing?.status === "failed") {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-xl border border-error/30 bg-error-light p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-error shadow-sm">
          <AlertTriangle className="size-6" />
        </span>
        <div>
          <p className="text-lg font-bold text-text-primary">
            Document processing failed
          </p>
          <p className="mt-1 max-w-lg text-sm text-text-secondary">
            {processing.errorMessage ??
              "The original file is preserved and can be retried."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={isProcessingAction}
            onClick={() => void retryProcessing()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            <RefreshCw className="size-4" /> Retry processing
          </button>
          <button
            type="button"
            disabled={isProcessingAction}
            onClick={() => void deleteProcessing()}
            className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-surface px-4 py-2 text-sm font-semibold text-error disabled:opacity-60"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-accent bg-accent-lighter px-6 py-6 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-surface text-accent shadow-sm">
          <CometSpinner className="size-8" />
        </span>
        <p className="mt-2 text-lg font-bold text-text-primary">
          Preparing your document
        </p>
        <p className="text-sm text-text-secondary">
          {PROCESSING_STAGE_COPY[processing.stage] ??
            "Processing the uploaded document"}
        </p>
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <FileText className="size-4" /> {processing.originalFileName}
        </p>
        <p className="mt-2 flex items-center gap-2 rounded-lg bg-surface/70 px-3 py-2 text-xs text-text-muted">
          <FileSearch className="size-4" /> Processing continues safely if you
          leave this page.
        </p>
      </div>
    );
  }

  if (duplicate) {
    return (
      <div className="flex min-h-[240px] flex-col justify-center gap-5 rounded-xl border border-warning/40 bg-warning-light p-6">
        <div>
          <p className="text-sm font-semibold text-text-primary">This file already exists</p>
          <p className="mt-1 text-sm text-text-secondary">
            “{duplicate.existingDocument.title}” has the same file content. Open it or keep this upload as a separate copy.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => void resolveDuplicate("open_existing")} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60">
            <FolderOpen className="size-4" /> Open existing document
          </button>
          <button type="button" onClick={() => void resolveDuplicate("continue_as_new")} disabled={busy} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary disabled:opacity-60">
            Continue as new copy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div
        role="button"
        tabIndex={0}
        aria-label="File drop zone — drag and drop your file here or choose a file"
        aria-busy={busy}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !busy) inputRef.current?.click(); }}
        className={`flex min-h-[240px] flex-1 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-6 transition-colors ${busy || isDragging ? "border-accent bg-accent-lighter" : "border-accent-light/50 bg-accent-muted hover:border-accent hover:bg-accent-lighter"}`}
      >
        {busy ? (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-surface text-accent shadow-sm"><CometSpinner className="size-8" /></span>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {phase === "hashing" ? "Checking file…" : phase === "uploading" ? `Uploading ${progress}%` : phase === "paused" ? `Upload paused at ${progress}%` : "Starting processing…"}
            </p>
            <p className="flex items-center gap-2 text-sm text-text-secondary"><FileText className="size-4" />{fileName}</p>
            {phase === "uploading" || phase === "paused" ? (
              <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-border"><div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div>
            ) : null}
            {phase === "uploading" ? <button type="button" onClick={(event) => { event.stopPropagation(); pauseUpload(); }} className="text-xs font-medium text-text-secondary hover:text-text-primary">Pause upload</button> : null}
            {phase === "paused" ? <button type="button" onClick={(event) => { event.stopPropagation(); resumeUpload(); }} className="text-xs font-medium text-accent hover:text-accent-dark">Resume upload</button> : null}
          </>
        ) : (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-surface text-accent shadow-sm"><Upload className="size-8 stroke-[2.5]" /></span>
            <p className="mt-2 text-lg font-bold text-text-primary">Drag &amp; drop your file here</p>
            <p className="text-sm text-text-muted">or</p>
            <button type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }} className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-dark">Choose File</button>
            <p className="mt-2 text-xs text-text-secondary">Supports PDF, DOCX, TXT, MD up to {MAX_UPLOAD_LABEL}</p>
          </>
        )}
        <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(",")} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.target.value = ""; }} />
      </div>
      {error ? <InlineAlert title="Upload failed" variant="error"><span className="flex items-center justify-between gap-3">{error}<button type="button" onClick={() => setError(null)} aria-label="Dismiss error" className="text-text-muted hover:text-text-primary"><X className="size-4" /></button></span></InlineAlert> : null}
    </div>
  );
}
