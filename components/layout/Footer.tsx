import Link from "next/link";

const footerLinks = ["Features", "How It Works", "Resources"];

export function Footer() {
  return (
    <footer className="border-t border-border-light bg-background-soft px-4 py-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3 text-text-primary">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            DO
          </span>
          <span className="font-semibold">Document Optimizer</span>
        </Link>
        <div className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
              className="transition hover:text-accent"
            >
              {item}
            </Link>
          ))}
        </div>
        <p className="text-text-muted">
          Preview-first AI edits for safer documents.
        </p>
      </div>
    </footer>
  );
}
