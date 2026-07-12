import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { invalidateDocumentCache } from "@/lib/cache/workspace-cache";
import { renameDocument } from "@/lib/documents/documents-library.service";
import { documentIdParamSchema, documentTitleSchema } from "@/lib/documents/document.validators";
import { z } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const renameSchema = z.object({
  title: documentTitleSchema,
});

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
          error: parsedParams.error.issues[0]?.message ?? "Invalid document id.",
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

    const parsed = renameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid title.",
        },
        { status: 400 },
      );
    }

    const result = await renameDocument(userId, id, parsed.data.title);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 },
      );
    }

    invalidateDocumentCache(userId, id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/documents/[id]/rename]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
