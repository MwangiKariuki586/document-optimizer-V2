import type { Json } from "@/lib/supabase/types";

export type IngestionStatus =
  | "awaiting_upload"
  | "queued"
  | "processing"
  | "duplicate_pending"
  | "completed"
  | "failed"
  | "duplicate_resolved";

export type DuplicateResolution =
  | "pending"
  | "open_existing"
  | "continue_as_new";

export type ExistingDocumentSummary = {
  id: string;
  title: string;
  fileType: string;
  updatedAt: string;
};

export type IngestionState = {
  id: string;
  documentId: string | null;
  originalFileName: string;
  status: IngestionStatus;
  stage: string;
  attemptCount: number;
  errorCode: string | null;
  errorMessage: string | null;
  duplicateResolution: DuplicateResolution;
  existingDocument: ExistingDocumentSummary | null;
  metrics: Json;
  createdAt: string;
  updatedAt: string;
};

export type SignedUploadTarget = {
  bucket: "documents";
  objectKey: string;
  token: string;
  storageUrl: string;
};

export type InitializeUploadResult =
  | {
      status: "upload_ready";
      ingestionId: string;
      documentId: string;
      upload: SignedUploadTarget;
    }
  | {
      status: "duplicate_detected";
      ingestionId: string;
      documentId: string | null;
      existingDocument: ExistingDocumentSummary;
    }
  | {
      status: "in_progress" | "completed" | "failed" | "duplicate_resolved";
      ingestionId: string;
      documentId: string | null;
      existingDocument?: ExistingDocumentSummary;
    };
