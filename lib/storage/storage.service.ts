import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const DOCUMENTS_BUCKET = "documents";

type UploadOriginalInput = {
  userId: string;
  documentId: string;
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
