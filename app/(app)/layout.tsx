import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProgressiveOnboarding } from "@/components/onboarding/ProgressiveOnboarding";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar hasClerk={hasClerk} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      <ProgressiveOnboarding />
    </div>
  );
}
