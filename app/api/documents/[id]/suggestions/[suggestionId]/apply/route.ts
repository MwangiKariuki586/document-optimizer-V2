import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  applySuggestion,
  SuggestionReplacementError,
} from "@/lib/suggestions/suggestions.service";
import { applyEditedResultSchema } from "@/lib/suggestions/suggestions.validators";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; suggestionId: string }>;
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

    const { id, suggestionId } = await params;
    let body: unknown = {};

    try {
      const rawBody = await req.text();
      body = rawBody.trim() ? (JSON.parse(rawBody) as unknown) : {};
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid preview content." },
        { status: 400 },
      );
    }

    const parsedBody = applyEditedResultSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsedBody.error.issues[0]?.message ?? "Invalid preview content.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    const result = await applySuggestion(supabase, {
      userId,
      documentId: id,
      suggestionId,
      editedMarkdown: parsedBody.data.editedMarkdown,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Suggestion not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/[suggestionId]/apply]", error);

    if (error instanceof SuggestionReplacementError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Could not apply suggestion." },
      { status: 500 },
    );
  }
}
