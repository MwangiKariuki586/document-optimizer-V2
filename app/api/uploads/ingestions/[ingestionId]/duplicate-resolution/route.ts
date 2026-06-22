import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { resolveDuplicateIngestion } from "@/lib/ingestion/ingestion.service";
import { duplicateResolutionSchema, ingestionIdParamSchema } from "@/lib/ingestion/ingestion.validators";

export async function POST(req: NextRequest, { params }: { params: Promise<{ ingestionId: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
  const parsedParams = ingestionIdParamSchema.safeParse(await params);
  if (!parsedParams.success) return NextResponse.json({ success: false, error: "Invalid ingestion." }, { status: 400 });
  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  const parsed = duplicateResolutionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: "Invalid duplicate action." }, { status: 400 });
  try {
    const result = await resolveDuplicateIngestion({
      userId,
      ingestionId: parsedParams.data.ingestionId,
      action: parsed.data.action,
    });
    if (!result) return NextResponse.json({ success: false, error: "Ingestion not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/uploads/duplicate-resolution]", error);
    return NextResponse.json({ success: false, error: "Failed to resolve duplicate." }, { status: 500 });
  }
}

