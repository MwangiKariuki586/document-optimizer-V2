"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthCtaLink } from "@/components/auth/AuthCtaLink";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navItems = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Safety", href: "#document-safety" },
  { label: "Formats", href: "#supported-formats" },
  { label: "Use Cases", href: "#use-cases" },
];

export function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 px-3 py-3 backdrop-blur sm:px-4">
      <nav className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between rounded-xl border border-border-light bg-surface px-3 shadow-card-soft sm:h-[72px] sm:px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-text-primary">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-overlay">
            <img
              src="/logo.png"
              alt="Docufine"
              className="h-9 w-9 object-cover"
            />
          </span>
          <span className="text-[19px] font-bold leading-7">Docufine</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary md:inline-flex"
          >
            Log in
          </Link>
          <AuthCtaLink
            hasClerk={hasClerk}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
          >
            Get Started
          </AuthCtaLink>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary md:hidden"
          aria-expanded={menuOpen}
          aria-controls="public-mobile-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        {menuOpen ? (
          <div
            id="public-mobile-menu"
            className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-xl border border-border bg-surface p-3 shadow-popover md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-surface-secondary hover:text-text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border-light pt-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-text-secondary"
              >
                Log in
              </Link>
              <AuthCtaLink
                hasClerk={hasClerk}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-3 text-sm font-medium text-accent-foreground transition hover:bg-accent-dark"
              >
                Get Started
              </AuthCtaLink>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
