import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { LayoutWrapper } from "@/components/LayoutWrapper";

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
      variables: { colorPrimary: '#1a3a5c' }
    }}>
      <html lang="en" className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased bg-white text-zinc-900 flex flex-col min-h-screen" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
