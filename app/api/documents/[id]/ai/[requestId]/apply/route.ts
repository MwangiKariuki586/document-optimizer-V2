import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { applyAIRequestResult } from "@/lib/ai/ai.service";
import { aiRequestRouteParamsSchema } from "@/lib/ai/ai.validators";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import { applyEditedResultSchema } from "@/lib/suggestions/suggestions.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; requestId: string }>;
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

    const parsedParams = aiRequestRouteParamsSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsedParams.error.issues[0]?.message ?? "Invalid AI result.",
        },
        { status: 400 },
      );
    }

    const { id, requestId } = parsedParams.data;
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
    await enforceRateLimitPreset(supabase, "versionMutation", {
      userId,
      documentId: id,
    });

    const result = await applyAIRequestResult(supabase, {
      userId,
      documentId: id,
      requestId,
      editedMarkdown: parsedBody.data.editedMarkdown,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "AI result not found." },
        { status: 404 },
      );
    }

    invalidateDocumentCache(userId, id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/ai/[requestId]/apply]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Could not apply AI result." },
      { status: 500 },
    );
  }
}
