"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Documents", href: "/documents" },
  { label: "Usage", href: "/account#usage" },
  { label: "Account", href: "/account" },
];

type AppHeaderProps = {
  hasClerk: boolean;
};

export function AppHeader({ hasClerk }: AppHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    const path = href.split("#")[0];

    if (path === "/dashboard") {
      return pathname === path;
    }

    return pathname.startsWith(path);
  };

  return (
    <header className="border-b border-border-light bg-background-soft/95 px-3 py-2 backdrop-blur md:px-5">
      <nav className="mx-auto flex min-h-14 max-w-[1280px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-overlay">
            <span className="absolute h-10 w-1 -rotate-45 rounded-full bg-surface" />
            <span className="absolute h-10 w-1 -rotate-45 rounded-full bg-surface/80 translate-x-1.5" />
            <span className="absolute h-10 w-1 -rotate-45 rounded-full bg-surface/60 -translate-x-1.5" />
          </span>
          <span className="text-sm font-bold leading-6 text-text-primary md:text-[15px]">
            Document Optimizer
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-medium transition hover:text-accent ${
                isActive(item.href) ? "text-accent" : "text-text-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/documents/new"
            className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition hover:bg-accent-dark"
          >
            New Document
          </Link>
          {hasClerk ? (
            <>
              <Show when="signed-in">
                <UserButton />
              </Show>
              <Show when="signed-out">
                <Link
                  href="/login"
                  className="rounded-md border border-border px-4 py-2 text-xs font-medium text-text-primary transition hover:bg-surface-secondary"
                >
                  Log in
                </Link>
              </Show>
            </>
          ) : (
            <Link
              href="/account"
              className="flex size-8 items-center justify-center rounded-full bg-accent-lighter text-xs font-bold text-accent"
              aria-label="Account"
            >
              DO
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md border border-border bg-surface text-text-primary md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="mx-auto mt-3 max-w-[1200px] rounded-2xl border border-border-light bg-surface p-3 shadow-card-soft md:hidden">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-accent-lighter text-accent"
                    : "text-text-secondary hover:bg-surface-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/documents/new"
              className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
              onClick={() => setIsOpen(false)}
            >
              New Document
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
