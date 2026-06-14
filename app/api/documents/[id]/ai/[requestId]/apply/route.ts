import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { applyAIRequestResult } from "@/lib/ai/ai.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; requestId: string }>;
};

export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const { id, requestId } = await params;
    const supabase = createSupabaseServerClient();
    const result = await applyAIRequestResult(supabase, {
      userId,
      documentId: id,
      requestId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "AI result not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/ai/[requestId]/apply]", error);

    return NextResponse.json(
      { success: false, error: "Could not apply AI result." },
      { status: 500 },
    );
  }
}
