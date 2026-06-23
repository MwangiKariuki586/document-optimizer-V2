import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

type LoginPageProps = {
  searchParams: Promise<{
    redirect_url?: string;
  }>;
};

async function getAppUrl(): Promise<string> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");

  if (host) {
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const protocol =
      forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");

    return `${protocol}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function getSafeRedirectPath(value: string | undefined): Promise<string> {
  if (!value) {
    return "/dashboard";
  }

  const appUrl = await getAppUrl();

  try {
    const target = new URL(value, appUrl);
    const app = new URL(appUrl);

    if (target.origin !== app.origin || target.pathname.startsWith("/login")) {
      return "/dashboard";
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (hasClerk) {
    const { userId } = await auth();

    if (userId) {
      const { redirect_url } = await searchParams;

      redirect(await getSafeRedirectPath(redirect_url));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <LoginPanel hasClerk={hasClerk} />
      </div>
    </main>
  );
}
