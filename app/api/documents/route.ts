import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  createBlankDocument,
  createPasteDocument,
} from "@/lib/documents/document.service";
import {
  createBlankDocumentSchema,
  createPasteDocumentSchema,
} from "@/lib/documents/document.validators";
import type { CreatedDocument } from "@/lib/documents/document.types";

function getSourceType(body: unknown): string {
  if (body && typeof body === "object" && "sourceType" in body) {
    const value = (body as { sourceType?: unknown }).sourceType;
    if (typeof value === "string") {
      return value;
    }
  }

  return "blank";
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

      document = await createPasteDocument({
        userId,
        title: parsed.data.title,
        content: parsed.data.content,
      });
    } else if (sourceType === "blank") {
      const parsed = createBlankDocumentSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: firstIssueMessage(parsed, "Invalid document details.") },
          { status: 400 },
        );
      }

      document = await createBlankDocument({
        userId,
        title: parsed.data.title,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported document source." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[api/documents]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
