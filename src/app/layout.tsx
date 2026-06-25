import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { NavBar } from "@/components/NavBar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "OpenSolve — Where Builders Meet Real Opportunities",
  description:
    "Solve real funded challenges from YC startups, government innovation programs, and top companies. Get hired, win prizes, build your reputation.",
  keywords: ["student competitions", "startup challenges", "coding bounties", "YC startups", "innovation challenges"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={{ 
      baseTheme: dark,
      variables: { colorPrimary: '#00cbe6' },
      elements: { card: 'bg-[#0c1324] border border-white/10' }
    }}>
      <html lang="en" className={`dark ${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased" style={{ fontFamily: "var(--font-inter), sans-serif", backgroundColor: "#020617", color: "#dce1fb" }}>
          {/* Ambient Lighting Background */}
          <div className="fixed inset-0 z-[-2] pointer-events-none bg-[#020617]">
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container/10 blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary-container/10 blur-[120px]"></div>
          </div>

          <NavBar />
          
          <main className="min-h-screen pt-20">
            {children}
          </main>

          <footer className="bg-surface-container-lowest border-t border-white/5 w-full py-16 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto">
              {/* Brand Column */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <Link href="/" className="font-display-lg-mobile text-3xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
                  OpenSolve
                </Link>
                <p className="font-body-md text-tertiary">Connecting student talent with real-world challenges from YC, government, and industry.</p>
              </div>

              {/* Links Column */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Link href="/about" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">About Us</Link>
                  <Link href="/terms" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">Terms of Service</Link>
                  <Link href="/privacy" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">Privacy Policy</Link>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="#" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">Contact Support</Link>
                  <Link href="#" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">Documentation</Link>
                  <Link href="#" className="font-body-md text-on-tertiary-container hover:text-primary transition-all">API Status</Link>
                </div>
              </div>

              {/* Copyright */}
              <div className="md:col-span-1 flex flex-col justify-end">
                <p className="font-body-md text-tertiary text-sm">© {new Date().getFullYear()} OpenSolve. All rights reserved. Built for the elite.</p>
                <p className="font-body-md text-tertiary text-xs mt-2 opacity-50">Built for the AWS + Vercel H0 Hackathon.</p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
