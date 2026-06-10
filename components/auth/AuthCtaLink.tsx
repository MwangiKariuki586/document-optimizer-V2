"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";

type AuthCtaLinkProps = {
  children: React.ReactNode;
  className: string;
  hasClerk: boolean;
};

export function AuthCtaLink({
  children,
  className,
  hasClerk,
}: AuthCtaLinkProps) {
  if (!hasClerk) {
    return (
      <Link href="/login" className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <Show when="signed-in">
        <Link href="/dashboard" prefetch={false} className={className}>
          {children}
        </Link>
      </Show>
      <Show when="signed-out">
        <Link href="/login" className={className}>
          {children}
        </Link>
      </Show>
    </>
  );
}
