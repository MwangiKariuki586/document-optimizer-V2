import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { documentIdParamSchema } from "@/lib/documents/document.validators";

type RouteContext = {
  params: Promise<{ id: string }>;
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

    return NextResponse.json(
      {
        success: false,
        error:
          "Review selected suggestions before applying them to the document.",
      },
      { status: 410 },
    );
  } catch (error) {
    console.error("[api/documents/[id]/suggestions/apply-all]", error);

    return NextResponse.json(
      { success: false, error: "Could not apply suggestions." },
      { status: 500 },
    );
  }
}
