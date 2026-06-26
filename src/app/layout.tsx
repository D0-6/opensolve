import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
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
      variables: { colorPrimary: '#a8581f' }
    }}>
      <html lang="en" className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased bg-white text-zinc-900" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          
          <NavBar />
          
          <main className="min-h-screen pt-20">
            {children}
          </main>

          <footer className="bg-zinc-50 border-t border-zinc-200 w-full py-16 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-[1600px] mx-auto">
              {/* Brand Column */}
              <div className="md:col-span-1 flex flex-col gap-4">
                <Link href="/" className="font-medium text-3xl text-zinc-900 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
                  OpenSolve
                </Link>
                <p className="text-zinc-500 text-sm">Connecting student talent with real-world challenges from YC, government, and industry.</p>
              </div>

              {/* Links Column */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Link href="/about" className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">About Us</Link>
                  <Link href="/terms" className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">Terms of Service</Link>
                  <Link href="/privacy" className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">Privacy Policy</Link>
                </div>
              </div>

              {/* Copyright */}
              <div className="md:col-span-1 flex flex-col justify-end">
                <p className="text-zinc-400 text-xs">© {new Date().getFullYear()} OpenSolve. All rights reserved. Built for the elite.</p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
