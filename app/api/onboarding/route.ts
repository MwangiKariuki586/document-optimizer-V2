import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/clerk";
import {
  getOnboardingState,
  updateOnboardingState,
} from "@/lib/onboarding/onboarding.service";
import { onboardingUpdateSchema } from "@/lib/onboarding/onboarding.validators";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to do that." },
        { status: 401 },
      );
    }

    const data = await getOnboardingState(createSupabaseServerClient(), userId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/onboarding GET]", error);
    return NextResponse.json(
      { success: false, error: "Could not load onboarding guidance." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const parsed = onboardingUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid onboarding update." },
        { status: 400 },
      );
    }

    const data = await updateOnboardingState(
      createSupabaseServerClient(),
      userId,
      parsed.data,
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/onboarding PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Could not update onboarding guidance." },
      { status: 500 },
    );
  }
}
