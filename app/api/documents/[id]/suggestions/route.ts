import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { listDocumentSuggestions } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const { id } = await params;
    const supabase = createSupabaseServerClient();
    console.log("[api/documents/[id]/suggestions] request", {
      documentId: id,
    });

    const suggestions = await listDocumentSuggestions(supabase, userId, id);

    if (!suggestions) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    console.log("[api/documents/[id]/suggestions] completed", {
      documentId: id,
      count: suggestions.length,
    });

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
