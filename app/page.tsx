import { Footer } from "@/components/layout/Footer";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Features } from "@/components/marketing/Features";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { OptimizationPreview } from "@/components/marketing/OptimizationPreview";

export default function Home() {
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
