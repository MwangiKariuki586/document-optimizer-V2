import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import {
  applySuggestion,
  SuggestionReplacementError,
} from "@/lib/suggestions/suggestions.service";
import {
  applyEditedResultSchema,
  suggestionRouteParamsSchema,
} from "@/lib/suggestions/suggestions.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; suggestionId: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const requestStartedAt = performance.now();
  let validationFinishedAt = requestStartedAt;

  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const parsedParams = suggestionRouteParamsSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsedParams.error.issues[0]?.message ?? "Invalid suggestion.",
        },
        { status: 400 },
      );
    }

    const { id, suggestionId } = parsedParams.data;
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
    validationFinishedAt = performance.now();

    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "suggestionMutation", {
      userId,
      documentId: id,
    });

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

    invalidateDocumentCache(userId, id);
    const response = NextResponse.json({ success: true, data: result });
    const timingEntries = Object.entries(result.serverTimings ?? {}).map(
      ([label, duration]) => `${label};dur=${duration}`,
    );
    response.headers.set(
      "Server-Timing",
      [
        `auth-validation;dur=${Math.round(validationFinishedAt - requestStartedAt)}`,
        ...timingEntries,
        `suggestion-apply;dur=${Math.round(performance.now() - requestStartedAt)}`,
      ].join(", "),
    );

    return response;
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/[suggestionId]/apply]", error);

    if (error instanceof SuggestionReplacementError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Could not apply suggestion." },
      { status: 500 },
    );
  }
}
