import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  applyPendingSuggestions,
  SuggestionReplacementError,
} from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
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

    const { id } = await params;
    const supabase = createSupabaseServerClient();
    const result = await applyPendingSuggestions(supabase, {
      userId,
      documentId: id,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/apply-all]", error);

    if (error instanceof SuggestionReplacementError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Could not apply suggestions." },
      { status: 500 },
    );
  }
}
