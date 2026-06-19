import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type QuickAction = {
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

type DashboardQuickActionsProps = {
  actions: QuickAction[];
};

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-3">
      {actions.map(({ description, href, icon: Icon, title }) => (
        <Link
          key={title}
          href={href}
          className="group relative flex h-[94px] min-w-0 items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 shadow-card-soft transition hover:border-border-strong hover:shadow-card"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border-light bg-accent-lighter text-accent shadow-card-soft">
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1 pr-8">
            <span className="block truncate whitespace-nowrap text-sm font-semibold leading-5 text-text-primary">
              {title}
            </span>
            <span className="mt-1.5 block text-xs leading-4 text-text-secondary">
              {description}
            </span>
          </span>
          <span className="absolute bottom-4 right-4 flex size-6 items-center justify-center rounded-md bg-accent-lighter text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowRight className="size-3.5" />
          </span>
        </Link>
      ))}
    </section>
  );
}
