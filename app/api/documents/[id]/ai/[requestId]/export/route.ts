import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { aiRequestRouteParamsSchema } from "@/lib/ai/ai.validators";
import { generateAIRequestExport } from "@/lib/export/export.service";
import { createExportSchema } from "@/lib/export/export.validators";

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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = createExportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid export request.",
        },
        { status: 400 },
      );
    }

    const { id, requestId } = parsedParams.data;
    const result = await generateAIRequestExport({
      userId,
      documentId: id,
      requestId,
      format: parsed.data.format,
      options: parsed.data.options,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "AI result not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/ai/[requestId]/export]", error);

    return NextResponse.json(
      { success: false, error: "Could not export AI result." },
      { status: 500 },
    );
  }
}
