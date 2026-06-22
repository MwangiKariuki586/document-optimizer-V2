import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import { createUploadedDocument } from "@/lib/documents/document.service";
import { validateUpload } from "@/lib/documents/upload.validators";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (process.env.ASYNC_UPLOADS_ENABLED !== "false") {
      return NextResponse.json(
        {
          success: false,
          error: "Direct upload initialization is required.",
          initializeAt: "/api/uploads/init",
        },
        { status: 410 },
      );
    }

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid upload request." },
        { status: 400 },
      );
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file was provided." },
        { status: 400 },
      );
    }

    const validation = validateUpload({ name: file.name, size: file.size });

    if (!validation.ok) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const data = Buffer.from(await file.arrayBuffer());

    const document = await createUploadedDocument({
      userId,
      fileType: validation.fileType,
      title: validation.title,
      safeFileName: validation.safeFileName,
      contentType: validation.contentType,
      data,
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("[api/upload]", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
