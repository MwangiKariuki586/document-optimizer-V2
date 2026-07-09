import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { initializeDocumentUpload } from "@/lib/ingestion/ingestion.service";
import { initializeUploadSchema } from "@/lib/ingestion/ingestion.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    }
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
    }
    const parsed = initializeUploadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid upload." },
        { status: 400 },
      );
    }
    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "uploadInit", { userId });

    const result = await initializeDocumentUpload({
      userId,
      fileName: parsed.data.name,
      fileSize: parsed.data.size,
      mimeType: parsed.data.mimeType,
      checksumSha256: parsed.data.checksumSha256,
      idempotencyKey: parsed.data.idempotencyKey,
      duplicateDecision: parsed.data.duplicateDecision,
    });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("[api/uploads/init]", error);
    if (error instanceof RateLimitExceededError) return rateLimitResponse(error);
    const message = error instanceof Error ? error.message : "Failed to initialize upload.";
    const status = /active upload|Invalid|large|Unsupported/.test(message) ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
