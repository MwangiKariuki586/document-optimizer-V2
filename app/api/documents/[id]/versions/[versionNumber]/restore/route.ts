import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { restoreDocumentVersion } from "@/lib/versions/versions.service";
import { restoreVersionParamsSchema } from "@/lib/versions/versions.validators";

type RouteContext = {
  params: Promise<{ id: string; versionNumber: string }>;
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

    const parsedParams = restoreVersionParamsSchema.safeParse(await params);

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsedParams.error.issues[0]?.message ?? "Invalid restore request.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "versionMutation", {
      userId,
      documentId: parsedParams.data.id,
    });

    const result = await restoreDocumentVersion(supabase, {
      userId,
      documentId: parsedParams.data.id,
      versionNumber: parsedParams.data.versionNumber,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Version not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/versions/restore]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
