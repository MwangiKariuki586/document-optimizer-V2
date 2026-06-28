import Link from "next/link";
import { AuthCtaLink } from "@/components/auth/AuthCtaLink";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const navItems = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Safety", href: "#document-safety" },
  { label: "Formats", href: "#supported-formats" },
  { label: "Use Cases", href: "#use-cases" },
];

export function PublicNavbar() {
  return (
    <header className="px-4 py-3 backdrop-blur">
      <nav className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between rounded-2xl border border-border-light bg-surface px-4 shadow-card-soft md:px-6">
        <Link href="/" className="flex items-center gap-3 text-text-primary">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-overlay">
            <img src="/logo.png" alt="Docufine" className="h-9 w-9 object-cover" />
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

        <div className="flex items-center gap-2">
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
      </nav>
    </header>
  );
}
