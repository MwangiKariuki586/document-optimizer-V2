import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { createSuggestionSelectionSchema } from "@/lib/suggestions/suggestions.validators";
import { createSuggestionPreviewSelection } from "@/lib/suggestions/suggestions.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parsed = createSuggestionSelectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid selection." },
        { status: 400 },
      );
    }

    const { id } = await params;
    const supabase = createSupabaseServerClient();
    const result = await createSuggestionPreviewSelection(supabase, {
      userId,
      documentId: id,
      suggestionIds: parsed.data.suggestionIds,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Suggestions not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/selections]", error);

    return NextResponse.json(
      { success: false, error: "Could not create suggestion review." },
      { status: 500 },
    );
  }
}
