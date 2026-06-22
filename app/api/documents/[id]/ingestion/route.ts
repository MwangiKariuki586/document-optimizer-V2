import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { getDocumentIngestion } from "@/lib/ingestion/ingestion.service";
import { documentIdParamSchema } from "@/lib/documents/document.validators";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
  const parsed = documentIdParamSchema.safeParse(await params);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid document." }, { status: 400 });
  try {
    const result = await getDocumentIngestion(userId, parsed.data.id);
    if (!result) return NextResponse.json({ success: false, error: "Ingestion not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/ingestion]", error);
    return NextResponse.json({ success: false, error: "Failed to load processing state." }, { status: 500 });
  }
}

