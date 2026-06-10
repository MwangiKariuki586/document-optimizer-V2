import Link from "next/link";
import { LoginPanel } from "@/components/auth/LoginPanel";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="max-w-2xl">
          <Link href="/" className="flex items-center gap-3 text-text-primary">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              DO
            </span>
            <span className="text-[19px] font-bold leading-7">
              Document Optimizer
            </span>
          </Link>
          <p className="mt-10 text-sm font-medium text-accent">
            Preview-first document improvement
          </p>
          <h1 className="mt-4 text-[34px] font-bold leading-[42px] text-text-primary md:text-[40px] md:leading-[48px]">
            Sign in to keep every document version-safe.
          </h1>
          <p className="mt-4 text-base leading-[26px] text-text-secondary">
            Upload, improve, preview, version, and export documents while your
            original files and applied AI changes stay under your control.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
            <div className="rounded-xl border border-border-light bg-surface p-4 shadow-card-soft">
              Private original files
            </div>
            <div className="rounded-xl border border-border-light bg-surface p-4 shadow-card-soft">
              Preview AI changes first
            </div>
            <div className="rounded-xl border border-border-light bg-surface p-4 shadow-card-soft">
              Restore previous versions
            </div>
            <div className="rounded-xl border border-border-light bg-surface p-4 shadow-card-soft">
              Export when ready
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <LoginPanel hasClerk={hasClerk} />
        </section>
      </div>
    </main>
  );
}
