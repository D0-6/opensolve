"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();
  const role = user?.publicMetadata?.role as string | undefined;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve the dashboard link based on the user's role and orgId.
  // Falls back to /dashboard which is a server-side dispatcher.
  const dashboardLink =
    role === "organization" && user?.publicMetadata?.orgId
      ? `/organizations/${user.publicMetadata.orgId}/dashboard`
      : role === "company"
      ? `/dashboard/company`
      : role === "student"
      ? `/dashboard/student`
      : "/dashboard";

  const navLinkClass = (href: string) =>
    `font-body-md font-medium transition-colors duration-200 ${
      pathname === href || (href === "/" && pathname === "/")
        ? "text-zinc-900 border-b-2 border-zinc-900 pb-1"
        : "text-zinc-500 hover:text-zinc-900"
    }`;

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-zinc-200">
      <div className="flex justify-between items-center px-6 max-w-[1600px] mx-auto h-20">
        {/* Brand Logo */}
        <Link href="/" className="font-display-lg text-3xl font-bold text-zinc-900 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
          OpenSolve
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={navLinkClass("/")}>Challenges</Link>
          <Link href="/about" className={navLinkClass("/about")}>About</Link>
          <span className="text-zinc-400 font-body-md cursor-not-allowed" title="Coming soon">Solutions</span>
          <span className="text-zinc-400 font-body-md cursor-not-allowed" title="Coming soon">Leaderboard</span>
        </nav>
        
        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoaded && isSignedIn && (
            <>
              <Link
                href={dashboardLink}
                className={navLinkClass(dashboardLink)}
              >
                Dashboard
              </Link>
              {(role === "organization" || role === "company") && (
                <Link href="/organizations/new" className="btn-primary px-6 py-2 font-body-md font-medium active:scale-95 transition-transform">
                  Post Challenge
                </Link>
              )}
              <div className="ml-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <>
              <Link href="/sign-in" className="text-zinc-500 font-body-md hover:text-zinc-900 transition-colors duration-200">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary px-6 py-2 font-body-md font-medium active:scale-95 transition-transform">
                Get Started
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-zinc-900 p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200 px-6 py-4 flex flex-col gap-4">
          <Link href="/" className="text-zinc-900 font-body-md font-medium py-2 border-b border-zinc-100" onClick={() => setMobileOpen(false)}>Challenges</Link>
          <Link href="/about" className="text-zinc-500 font-body-md hover:text-zinc-900 transition-colors py-2 border-b border-zinc-100" onClick={() => setMobileOpen(false)}>About</Link>
          
          {isLoaded && isSignedIn && (
            <>
              <Link href={dashboardLink} className="text-zinc-500 font-body-md hover:text-zinc-900 transition-colors py-2 border-b border-zinc-100" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {(role === "organization" || role === "company") && (
                <Link href="/organizations/new" className="text-[#1a3a5c] font-body-md font-medium py-2 border-b border-zinc-100" onClick={() => setMobileOpen(false)}>Post Challenge</Link>
              )}
              <div className="pt-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <div className="flex gap-4 pt-2">
              <Link href="/sign-in" className="btn-secondary px-4 py-2 flex-1 text-center" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary px-4 py-2 flex-1 text-center" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
