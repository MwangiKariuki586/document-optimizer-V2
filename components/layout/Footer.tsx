import Link from "next/link";

const footerLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Formats", href: "#supported-formats" },
  { label: "Use Cases", href: "#use-cases" },
];

const trustLinks = [
  { label: "Document Safety", href: "#document-safety" },
  { label: "Version Control", href: "#document-safety" },
  { label: "Private Files", href: "#document-safety" },
];

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-surface px-4 py-10">
      <div className="mx-auto grid max-w-[1200px] gap-8 text-sm text-text-secondary md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start">
        <div className="max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-text-primary"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-overlay">
              <img
                src="/logo.png"
                alt="Docufine"
                className="h-9 w-9 object-cover"
              />
            </span>
            <span className="text-base font-bold">Docufine</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Improve documents with AI while every change stays previewed,
            versioned, and under your control.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            Product
          </p>
          <div className="flex flex-col gap-2">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
            Safety
          </p>
          <div className="flex flex-col gap-2">
            {trustLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 transition hover:text-accent"
              >
                <span className="size-1.5 rounded-full bg-accent" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border-light pt-5 text-xs text-text-muted md:col-span-3 md:flex md:items-center md:justify-between">
          <p>&copy; 2026 Docufine. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Built for controlled document improvement.
          </p>
        </div>
      </div>
    </footer>
  );
}
