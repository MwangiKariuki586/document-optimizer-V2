export type DocumentSourceType = "upload" | "paste" | "blank";

export type CreateBlankDocumentInput = {
  userId: string;
  title: string;
};

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
