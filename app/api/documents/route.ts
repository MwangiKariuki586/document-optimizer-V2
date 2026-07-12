import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  getCachedDocumentsLibrary,
  invalidateDocumentCache,
} from "@/lib/cache/workspace-cache";
import { createPasteDocument } from "@/lib/documents/document.service";
import { parseDocumentsLibraryQuery } from "@/lib/documents/documents-library.query";
import { createPasteDocumentSchema } from "@/lib/documents/document.validators";
import {
  enforceRateLimitPreset,
  RateLimitExceededError,
} from "@/lib/rate-limit/rate-limit.service";
import { rateLimitResponse } from "@/lib/rate-limit/route-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreatedDocument } from "@/lib/documents/document.types";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const query = parseDocumentsLibraryQuery(
      (key) => req.nextUrl.searchParams.get(key) ?? undefined,
    );
    const data = await getCachedDocumentsLibrary({ userId, ...query });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/documents/list]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load documents." },
      { status: 500 },
    );
  }
}

function getSourceType(body: unknown): string {
  if (body && typeof body === "object" && "sourceType" in body) {
    const value = (body as { sourceType?: unknown }).sourceType;
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

function firstIssueMessage(
  result: { success: false; error: { issues: { message: string }[] } },
  fallback: string,
): string {
  return result.error.issues[0]?.message ?? fallback;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
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

    const sourceType = getSourceType(body);
    let document: CreatedDocument;

    if (sourceType === "paste") {
      const parsed = createPasteDocumentSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: firstIssueMessage(parsed, "Invalid document details.") },
          { status: 400 },
        );
      }

      const supabase = createSupabaseServerClient();
      await enforceRateLimitPreset(supabase, "pasteDocumentCreate", {
        userId,
      });

      document = await createPasteDocument({
        userId,
        title: parsed.data.title,
        content: parsed.data.content,
      });
      invalidateDocumentCache(userId, document.id);
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported document source." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[api/documents]", error);

    if (error instanceof RateLimitExceededError) {
      return rateLimitResponse(error);
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
