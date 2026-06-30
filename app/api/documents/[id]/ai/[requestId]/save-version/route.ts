import { NextResponse } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { saveAIRequestResultAsVersion } from "@/lib/ai/ai.service";
import { aiRequestRouteParamsSchema } from "@/lib/ai/ai.validators";
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
    const result = await saveAIRequestResultAsVersion(supabase, {
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
    console.error("[api/documents/[id]/ai/[requestId]/save-version]", error);

    return NextResponse.json(
      { success: false, error: "Could not save AI result as a version." },
      { status: 500 },
    );
  }
}
