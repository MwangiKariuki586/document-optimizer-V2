"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

type LoginPanelProps = {
  hasClerk: boolean;
};

export function LoginPanel({ hasClerk }: LoginPanelProps) {
  if (!hasClerk) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card-soft">
        <p className="text-sm font-medium text-accent">Authentication setup</p>
        <h1 className="mt-3 text-[28px] font-bold leading-9 text-text-primary">
          Add Clerk keys to enable login.
        </h1>
        <p className="mt-3 text-sm leading-[22px] text-text-secondary">
          Set{" "}
          <code className="rounded bg-surface-tertiary px-1 py-0.5 text-xs text-text-primary">
            NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          and{" "}
          <code className="rounded bg-surface-tertiary px-1 py-0.5 text-xs text-text-primary">
            CLERK_SECRET_KEY
          </code>{" "}
          in{" "}
          <code className="rounded bg-surface-tertiary px-1 py-0.5 text-xs text-text-primary">
            .env.local
          </code>
          , then restart the dev server to show the Clerk sign-in and sign-up
          experience here.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
        >
          Back to homepage
        </Link>
      </div>
    );
  }

  return (
    <SignIn
      fallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        elements: {
          cardBox:
            "rounded-2xl border border-border bg-surface shadow-card-soft",
          headerTitle: "text-text-primary",
          headerSubtitle: "text-text-secondary",
          formButtonPrimary:
            "bg-accent text-accent-foreground hover:bg-accent-dark",
          footerActionLink: "text-accent hover:text-accent-dark",
        },
      }}
    />
  );
}
