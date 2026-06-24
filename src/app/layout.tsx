import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { CursorWrapper } from "@/components/CursorWrapper";

export const metadata: Metadata = {
  title: "OpenSolve | Real Problems, Real Solutions",
  description: "A platform aggregating real funded problems. Submit solutions, get hired, win contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <CursorWrapper />
        <nav className="w-full border-b border-border sticky top-0 z-50 py-5 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-light transition-colors">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-serif font-semibold text-foreground">OpenSolve</span>
            </Link>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="/" className="text-text-secondary hover:text-foreground transition-colors">Problems</Link>
              <Link href="/organizations/new" className="text-text-secondary hover:text-foreground transition-colors">Post Problem</Link>
              <Link href="/profile/claim" className="text-text-secondary hover:text-foreground transition-colors">Profile</Link>
              <Link href="/about" className="text-text-secondary hover:text-foreground transition-colors">About</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-16">
          {children}
        </main>
        <footer className="w-full py-12 text-center text-sm text-text-secondary mt-24 border-t border-border">
          <p className="mb-4">© {new Date().getFullYear()} OpenSolve. Connecting talent with real problems.</p>
          <div className="flex justify-center gap-8">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
