import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import { completeDocumentUpload } from "@/lib/ingestion/ingestion.service";
import { ingestionDocumentParamSchema } from "@/lib/ingestion/ingestion.validators";

export async function POST(_req: Request, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    const parsed = ingestionDocumentParamSchema.safeParse(await params);
    if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid document." }, { status: 400 });
    const result = await completeDocumentUpload(userId, parsed.data.documentId);
    if (!result) return NextResponse.json({ success: false, error: "Upload not found." }, { status: 404 });
    invalidateDocumentCache(userId, parsed.data.documentId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/uploads/complete]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to complete upload." },
      { status: 400 },
    );
  }
}

