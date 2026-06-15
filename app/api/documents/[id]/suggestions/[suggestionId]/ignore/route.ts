import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { ignoreSuggestion } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; suggestionId: string }>;
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

    const { id, suggestionId } = await params;
    const supabase = createSupabaseServerClient();
    const result = await ignoreSuggestion(supabase, {
      userId,
      documentId: id,
      suggestionId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Suggestion not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/[suggestionId]/ignore]", error);

    return NextResponse.json(
      { success: false, error: "Could not ignore suggestion." },
      { status: 500 },
    );
  }
}
