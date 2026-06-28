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
    <div className="auth-modal rounded-2xl border border-border bg-surface p-2 shadow-popover">
      <div className="border-b border-border-light px-6 py-5 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-overlay">
          <img src="/logo.png" alt="Docufine" className="h-11 w-11 object-cover" />
        </div>
        <p className="mt-3 text-sm font-semibold text-text-primary">Docufine</p>
        <p className="mt-1 text-xs leading-4 text-text-muted">
          Sign in to continue your Docufine workspace.
        </p>
      </div>
      <SignIn
        fallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full border-0 bg-transparent shadow-none",
            card: "w-full bg-transparent px-4 pb-5 pt-4 shadow-none",
            header: "hidden",
            footer: "hidden",
            socialButtonsBlockButton:
              "border-border bg-surface text-text-primary hover:bg-surface-secondary",
            socialButtonsBlockButtonText: "text-text-primary",
            dividerLine: "bg-border-light",
            dividerText: "text-text-muted",
            formFieldLabel: "text-text-secondary",
            formFieldInput:
              "rounded-md border-border bg-surface text-text-primary focus:border-accent focus:ring-2 focus:ring-accent",
            formFieldInputShowPasswordButton: "text-text-muted",
            formButtonPrimary:
              "rounded-md bg-accent text-sm font-medium text-accent-foreground hover:bg-accent-dark",
            footerAction: "text-text-secondary",
            footerActionLink: "text-accent hover:text-accent-dark",
            identityPreviewText: "text-text-primary",
            identityPreviewEditButton: "text-accent hover:text-accent-dark",
            formResendCodeLink: "text-accent hover:text-accent-dark",
          },
        }}
      />
    </div>
  );
}
