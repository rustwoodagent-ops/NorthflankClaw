import type { Metadata } from "next";
import { Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Navigation } from "@/components/ui/Navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VOX AI — Vocal Analysis Platform",
  description:
    "AI-powered vocal coaching. Record your voice, get specific, actionable feedback on pitch, tone, breath, and technique.",
  keywords: ["vocal coach", "singing analysis", "pitch tracking", "voice AI"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${syne.variable} ${spaceMono.variable}`}>
      <body className="bg-bg text-text antialiased min-h-screen">
        <SessionProvider session={session}>
          <TRPCProvider>
            <Navigation />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
