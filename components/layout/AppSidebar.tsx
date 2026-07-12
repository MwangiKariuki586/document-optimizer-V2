"use client";

import Link from "next/link";
import { Show, UserButton, useUser } from "@clerk/nextjs";
import {
  ChevronsLeft,
  ChevronsRight,
  Download,
  Files,
  FileText,
  Gauge,
  History,
  Plus,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type AppSidebarProps = {
  hasClerk: boolean;
};

type NavItem = {
  href: string;
  icon: typeof Gauge;
  label: string;
  match?: (pathname: string) => boolean;
};

const clerkAccountAppearance = {
  elements: {
    userButtonAvatarBox: "size-9",
    userButtonPopoverCard:
      "w-[292px] rounded-2xl border border-border bg-surface shadow-popover",
    userButtonPopoverFooter: "hidden",
    userButtonPopoverActionButton:
      "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
    userButtonPopoverActionButtonIcon: "text-text-muted",
    userButtonPopoverActionButtonText: "text-sm font-medium",
    userPreviewAvatarBox: "size-10",
    userPreviewMainIdentifier: "text-sm font-semibold text-text-primary",
    userPreviewSecondaryIdentifier: "text-sm text-text-muted",
  },
};

const clerkProfileAppearance = {
  elements: {
    modalBackdrop: "bg-overlay-muted",
    modalContent:
      "overflow-hidden rounded-2xl border border-border bg-surface shadow-popover",
    modalCloseButton:
      "text-text-muted hover:bg-surface-secondary hover:text-text-primary",
    userProfileRoot: "bg-surface text-text-primary",
    userProfileCard: "border-0 bg-surface shadow-none",
    navbar: "border-r border-border-light bg-surface-secondary",
    navbarFooter: "hidden",
    navbarButton:
      "rounded-md text-text-secondary hover:bg-surface hover:text-text-primary",
    navbarButtonIcon: "text-text-muted",
    navbarButtonText: "text-sm font-medium",
    pageScrollBox: "bg-surface",
    profileSectionTitle: "text-text-primary",
    profileSectionPrimaryButton:
      "bg-accent text-accent-foreground hover:bg-accent-dark",
    profileSectionItem: "border-border-light",
    formFieldInput:
      "rounded-md border-border bg-surface text-text-primary focus:border-accent focus:ring-2 focus:ring-accent",
    formButtonPrimary:
      "rounded-md bg-accent text-accent-foreground hover:bg-accent-dark",
    badge: "border-border bg-surface-secondary text-text-secondary",
    footer: "hidden",
  },
};

const primaryItems: NavItem[] = [
  {
    href: "/dashboard",
    icon: Gauge,
    label: "Dashboard",
    match: (pathname) => pathname === "/dashboard",
  },

  {
    href: "/documents",
    icon: Files,
    label: "Documents",
    match: (pathname) =>
      pathname === "/documents" || pathname.startsWith("/documents?"),
  },

  {
    href: "/documents/new",
    icon: Plus,
    label: "New Document",
    match: (pathname) => pathname === "/documents/new",
  },

  {
    href: "/account",
    icon: Settings,
    label: "Account",
    match: (pathname) => pathname === "/account",
  },
];

function getDocumentId(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "documents" || !segments[1] || segments[1] === "new") {
    return null;
  }

  return segments[1];
}

function AppNavLink({
  collapsed,
  item,
  pathname,
}: {
  collapsed: boolean;
  item: NavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = item.match ? item.match(pathname) : pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={`text-xs font-medium transition ${
        collapsed
          ? "flex size-9 items-center justify-center rounded-md"
          : "flex items-center gap-3 rounded-md px-3 py-2"
      } ${
        isActive
          ? "bg-accent-light text-accent"
          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
      }`}
    >
      <Icon className="size-3.5 shrink-0" />
      {collapsed ? null : <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function SidebarAccountName() {
  const { user } = useUser();
  const accountName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Account";

  return (
    <span className="min-w-0 truncate text-xs font-medium text-text-primary">
      {accountName}
    </span>
  );
}

function MobileNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = item.match ? item.match(pathname) : pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition ${
        isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
      }`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-md ${
          isActive ? "bg-accent-light" : ""
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

export function AppSidebar({ hasClerk }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const documentId = getDocumentId(pathname);
  const documentItems = useMemo<NavItem[]>(
    () =>
      documentId
        ? [
            {
              href: `/documents/${documentId}`,
              icon: FileText,
              label: "Editor",
              match: (currentPath) =>
                currentPath === `/documents/${documentId}`,
            },
            {
              href: `/documents/${documentId}/versions`,
              icon: History,
              label: "Versions",
              match: (currentPath) =>
                currentPath === `/documents/${documentId}/versions`,
            },
            {
              href: `/documents/${documentId}/export`,
              icon: Download,
              label: "Export",
              match: (currentPath) =>
                currentPath === `/documents/${documentId}/export`,
            },
          ]
        : [],
    [documentId],
  );

  const mobileItems = documentId
    ? [primaryItems[1], ...documentItems.slice(0, 1), primaryItems[2], ...documentItems.slice(1)]
    : primaryItems;

  return (
    <>
      <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-light bg-background-soft px-3 py-3 transition-[width] md:flex ${
        collapsed ? "w-[64px] items-center" : "w-[254px]"
      }`}
      aria-label="Workspace navigation"
    >
      <div
        className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {collapsed ? (
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-overlay"
            aria-label="Docufine dashboard"
            title="Docufine"
          >
            <img
              src="/logo.png"
              alt="Docufine"
              className="h-9 w-9 object-cover"
            />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-overlay">
              <img
                src="/logo.png"
                alt="Docufine"
                className="h-9 w-9 object-cover"
              />
            </span>
            <span className="truncate text-sm font-bold leading-5 text-text-primary">
              Docufine
            </span>
          </Link>
        )}

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-secondary hover:text-text-primary"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronsLeft className="size-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mt-3 flex size-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary shadow-card-soft transition hover:bg-surface-secondary hover:text-text-primary"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronsRight className="size-4" />
        </button>
      ) : null}

      <nav
        className={`mt-5 flex w-full flex-col gap-1 ${collapsed ? "items-center" : ""}`}
      >
        {primaryItems.map((item) => (
          <AppNavLink
            key={item.href}
            collapsed={collapsed}
            item={item}
            pathname={pathname}
          />
        ))}
      </nav>

      {documentItems.length > 0 ? (
        <div
          className={`mt-5 w-full border-t border-border-light pt-4 ${collapsed ? "flex flex-col items-center" : ""}`}
        >
          {!collapsed ? (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-normal text-text-muted">
              Current document
            </p>
          ) : null}
          <nav
            className={`flex w-full flex-col gap-1 ${collapsed ? "items-center" : ""}`}
          >
            {documentItems.map((item) => (
              <AppNavLink
                key={item.href}
                collapsed={collapsed}
                item={item}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      ) : null}

      <div
        className={`mt-auto flex w-full flex-col ${collapsed ? "items-center gap-2" : "gap-3"}`}
      >
        {hasClerk ? (
          <Show when="signed-in">
            <div
              className={
                collapsed
                  ? "flex size-9 items-center justify-center"
                  : "flex w-full items-center  gap-2 rounded-xl border border-border bg-surface px-2 py-2 shadow-card-soft"
              }
            >
              <UserButton
                userProfileMode="modal"
                appearance={clerkAccountAppearance}
                userProfileProps={{
                  appearance: clerkProfileAppearance,
                }}
              />
              {!collapsed ? <SidebarAccountName /> : null}
            </div>
          </Show>
        ) : (
          <Link
            href="/account"
            className="flex size-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-card-soft"
            aria-label="Account"
            title="Account"
          >
            DO
          </Link>
        )}
      </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex min-h-16 items-stretch border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_rgba(23,19,33,0.08)] md:hidden"
        aria-label="Mobile workspace navigation"
      >
        {mobileItems.map((item) => (
          <MobileNavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </>
  );
}
