import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { updateDocumentContent } from "@/lib/documents/document.service";
import {
  documentIdParamSchema,
  updateDocumentSchema,
} from "@/lib/documents/document.validators";
import type { Json } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid document details.",
        },
        { status: 400 },
      );
    }

    const result = await updateDocumentContent({
      userId,
      documentId: id,
      title: parsed.data.title,
      editorJson: parsed.data.editorJson as Json,
      currentMarkdown: parsed.data.currentMarkdown,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
