import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { documentIdParamSchema } from "@/lib/documents/document.validators";
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

    const parsedParams = documentIdParamSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsedParams.error.issues[0]?.message ?? "Invalid document id.",
        },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = createSuggestionSelectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid selection." },
        { status: 400 },
      );
    }

    const { id } = parsedParams.data;
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
