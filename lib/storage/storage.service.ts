import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const DOCUMENTS_BUCKET = "documents";
const EXPORTS_BUCKET = "exports";

type UploadOriginalInput = {
  userId: string;
  documentId: string;
  fileName: string;
  contentType: string;
  data: Buffer;
};

type UploadExportInput = {
  userId: string;
  documentId: string;
  exportId: string;
  fileName: string;
  contentType: string;
  data: Buffer;
};

// Builds the private storage key: {userId}/{documentId}/original/{safeFileName}
function buildOriginalKey(
  userId: string,
  documentId: string,
  fileName: string,
): string {
  return `${userId}/${documentId}/original/${fileName}`;
}

function buildExportKey(input: UploadExportInput): string {
  return `${input.userId}/${input.documentId}/exports/${input.exportId}-${input.fileName}`;
}

export async function uploadOriginalFile(
  supabase: SupabaseClient<Database>,
  input: UploadOriginalInput,
): Promise<string> {
  const fileKey = buildOriginalKey(
    input.userId,
    input.documentId,
    input.fileName,
  );

  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(fileKey, input.data, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    console.error("[storage/upload-original]", error.message);
    throw new Error("Failed to store the uploaded file");
  }

  return fileKey;
}

// Best-effort cleanup used when a later step in the upload flow fails.
export async function removeOriginalFile(
  supabase: SupabaseClient<Database>,
  fileKey: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([fileKey]);

  if (error) {
    console.error("[storage/remove-original]", error.message);
  }
}

export async function uploadExportFile(
  supabase: SupabaseClient<Database>,
  input: UploadExportInput,
): Promise<string> {
  const fileKey = buildExportKey(input);

  const { error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .upload(fileKey, input.data, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) {
    console.error("[storage/upload-export]", error.message);
    throw new Error("Failed to store the exported file");
  }

  return fileKey;
}

export async function createSignedExportUrl(
  supabase: SupabaseClient<Database>,
  fileKey: string,
  fileName?: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .createSignedUrl(fileKey, 60 * 10);

  if (error || !data?.signedUrl) {
    console.error("[storage/sign-export]", error?.message);
    throw new Error("Failed to create export download link");
  }

  if (!fileName) {
    return data.signedUrl;
  }

  const signedUrl = new URL(data.signedUrl);
  signedUrl.searchParams.set("download", fileName);

  return signedUrl.toString();
}

export async function removeExportFile(
  supabase: SupabaseClient<Database>,
  fileKey: string,
): Promise<void> {
  const { error } = await supabase.storage.from(EXPORTS_BUCKET).remove([fileKey]);

  if (error) {
    console.error("[storage/remove-export]", error.message);
  }
}

export async function downloadExportFile(
  supabase: SupabaseClient<Database>,
  fileKey: string,
): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .download(fileKey);

  if (error || !data) {
    console.error("[storage/download-export]", error?.message);
    throw new Error("Failed to download export file");
  }

  return Buffer.from(await data.arrayBuffer());
}
