"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import Link from "next/link";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // If it's an admin route, DO NOT render the NavBar or Footer.
    // The AdminLayout (src/app/admin/layout.tsx) handles its own sidebar.
    return <>{children}</>;
  }

  return (
    <>
      <NavBar />
      
      <main className="min-h-screen pt-20">
        {children}
      </main>

      <footer className="border-t border-white/10 w-full py-16 md:py-32 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 max-w-[1600px] mx-auto">
          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="font-medium text-3xl text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
              OpenSolve
            </Link>
            <p className="text-zinc-500 text-sm">Connecting student talent with real-world challenges from YC, government, and industry.</p>
          </div>

          {/* Links Column */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">About Us</Link>
              <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">Terms of Service</Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="md:col-span-1 flex flex-col justify-end">
            <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} OpenSolve. All rights reserved. Built for the elite.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
