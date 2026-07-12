import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import { ignoreSuggestion } from "@/lib/suggestions/suggestions.service";
import { suggestionRouteParamsSchema } from "@/lib/suggestions/suggestions.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
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
    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "suggestionMutation", {
      userId,
      documentId: id,
    });

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

    invalidateDocumentCache(userId, id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/[suggestionId]/ignore]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Could not ignore suggestion." },
      { status: 500 },
    );
  }
}
