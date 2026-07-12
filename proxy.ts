import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/documents(.*)",
  "/account(.*)",
  "/coming-soon(.*)",
  "/api/documents(.*)",
  "/api/upload(.*)",
  "/api/usage(.*)",
  "/api/onboarding(.*)",
]);

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default hasClerk
  ? clerkProxy
  : function proxy(req: NextRequest) {
      if (process.env.NODE_ENV === "production" && isProtectedRoute(req)) {
        return NextResponse.json(
          { success: false, error: "Authentication is not configured." },
          { status: 503 },
        );
      }

      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
