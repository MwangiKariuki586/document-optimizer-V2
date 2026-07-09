import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { saveAIRequestResultAsDocumentCopy } from "@/lib/ai/ai.service";
import { aiRequestRouteParamsSchema } from "@/lib/ai/ai.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string; requestId: string }>;
};

export async function POST(_req: Request, { params }: RouteContext) {
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
    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "versionMutation", {
      userId,
      documentId: id,
    });

    const result = await saveAIRequestResultAsDocumentCopy(supabase, {
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
    console.error("[api/documents/[id]/ai/[requestId]/save-copy]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Could not save AI result as a new document." },
      { status: 500 },
    );
  }
}
