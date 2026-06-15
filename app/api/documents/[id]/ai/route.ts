import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { runDocumentAIAction } from "@/lib/ai/ai.service";
import { runAIActionRequestSchema } from "@/lib/ai/ai.validators";
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

    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = runAIActionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid AI action.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    console.log("[api/documents/[id]/ai] request", {
      documentId: id,
      action: parsed.data.action,
      contentLength: parsed.data.contentMarkdown.length,
    });

    const result = await runDocumentAIAction(supabase, {
      userId,
      documentId: id,
      action: parsed.data.action,
      contentMarkdown: parsed.data.contentMarkdown,
      options: parsed.data.options,
      provider: parsed.data.provider,
      model: parsed.data.model,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    if (result.status === "failed") {
      console.log("[api/documents/[id]/ai] failed", {
        documentId: id,
        requestId: result.id,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          data: { id: result.id, status: result.status },
        },
        { status: 502 },
      );
    }

    console.log("[api/documents/[id]/ai] completed", {
      documentId: id,
      requestId: result.id,
      mode: result.result.mode,
      suggestionCount: result.result.output.suggestions.length,
      hasRevisedMarkdown: Boolean(result.result.output.revisedMarkdown),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
        result: result.result,
      },
    });
  } catch (error) {
    console.error("[api/documents/[id]/ai]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
