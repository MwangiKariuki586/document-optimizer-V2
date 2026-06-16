import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { downloadDocumentExport } from "@/lib/export/export.service";

type RouteContext = {
  params: Promise<{ id: string; exportId: string }>;
};

function contentDisposition(fileName: string): string {
  const safeFileName = fileName.replace(/["\r\n]/g, "_");
  return `attachment; filename="${safeFileName}"`;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const { id, exportId } = await params;
    const exportFile = await downloadDocumentExport({
      userId,
      documentId: id,
      exportId,
    });

    if (!exportFile) {
      return NextResponse.json(
        { success: false, error: "Export not found." },
        { status: 404 },
      );
    }

    const body = new Blob([new Uint8Array(exportFile.data)], {
      type: exportFile.contentType,
    });

    return new NextResponse(body, {
      headers: {
        "Content-Type": exportFile.contentType,
        "Content-Disposition": contentDisposition(exportFile.fileName),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[api/documents/[id]/export/[exportId]/download]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
