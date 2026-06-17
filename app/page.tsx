import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { OptimizationPreview } from "@/components/marketing/OptimizationPreview";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default async function Home() {
  if (hasClerk) {
    const { userId } = await auth();

    if (userId) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">
        <Hero />
        <OptimizationPreview />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
