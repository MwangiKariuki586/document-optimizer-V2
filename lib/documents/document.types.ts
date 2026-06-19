import type { Json } from "@/lib/supabase/types";

export type DocumentSourceType = "upload" | "paste" | "blank";

export type CreatePasteDocumentInput = {
  userId: string;
  title: string;
  content: string;
};

export type CreateUploadedDocumentInput = {
  userId: string;
  fileType: "pdf" | "docx" | "markdown" | "txt";
  title: string;
  safeFileName: string;
  contentType: string;
  data: Buffer;
};

export type CreatedDocument = {
  id: string;
  title: string;
};

export type CreatedUploadedDocument = CreatedDocument & {
  warnings: string[];
};

// Document data shape passed to the editor workspace (client).
export type EditorDocument = {
  id: string;
  title: string;
  fileType: string;
  fidelityStatus: string;
  hasOriginalFile: boolean;
  editorJson: Json | null;
  currentMarkdown: string;
  wordCount: number;
  updatedAt: string;
  versionNumber: number;
};

export type UpdateDocumentContentInput = {
  userId: string;
  documentId: string;
  title: string;
  editorJson: Json;
  currentMarkdown: string;
};

export type CreateManualVersionInput = {
  userId: string;
  documentId: string;
  title: string;
  editorJson: Json;
  currentMarkdown: string;
  notes?: string | null;
};
