import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Zap } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <nav className="w-full glass-panel sticky top-0 z-50 py-4 px-6 mb-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              <Zap className="w-6 h-6" />
              OpenSolve
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-500 transition-colors">Problems</Link>
              <Link href="/organizations/new" className="hover:text-blue-500 transition-colors">Post a Problem</Link>
              <Link href="/profile/claim" className="hover:text-blue-500 transition-colors">My Profile</Link>
              <Link href="/about" className="hover:text-blue-500 transition-colors">About</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 pb-20">
          {children}
        </main>
        <footer className="w-full py-8 text-center text-sm text-slate-500 mt-20 border-t border-slate-200 dark:border-slate-800">
          <p>© {new Date().getFullYear()} OpenSolve Hackathon Prototype.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Use</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
