import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import { createManualVersion } from "@/lib/documents/document.service";
import {
  createVersionSchema,
  documentIdParamSchema,
} from "@/lib/documents/document.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { listDocumentVersions } from "@/lib/versions/versions.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
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

    const { id } = parsedParams.data;
    const supabase = createSupabaseServerClient();
    const versions = await listDocumentVersions(supabase, userId, id);

    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("[api/documents/[id]/versions GET]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    const { id } = parsedParams.data;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const parsed = createVersionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid version details.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    await enforceRateLimitPreset(supabase, "versionMutation", {
      userId,
      documentId: id,
    });

    const result = await createManualVersion({
      userId,
      documentId: id,
      title: parsed.data.title,
      editorJson: parsed.data.editorJson as Json,
      currentMarkdown: parsed.data.currentMarkdown,
      notes: parsed.data.notes ?? null,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    invalidateDocumentCache(userId, id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/versions]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
