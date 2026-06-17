import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";

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

    await params;

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
