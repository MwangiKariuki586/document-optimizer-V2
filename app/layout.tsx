import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/feedback/AppToaster";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Docufine",
  description:
    "AI-powered document improvement with preview-first edits and version safety.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const document = (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <AppToaster />
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return document;
  }

  return <ClerkProvider>{document}</ClerkProvider>;
}
