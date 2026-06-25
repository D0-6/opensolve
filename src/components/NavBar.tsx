"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0c1324]/60 backdrop-blur-xl border-b border-white/10 shadow-sm">
      <div className="flex justify-between items-center px-6 max-w-7xl mx-auto h-20">
        {/* Brand Logo */}
        <Link href="/" className="font-display-lg text-3xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>hexagon</span>
          OpenSolve
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-primary border-b-2 border-primary pb-1 font-body-md hover:text-secondary transition-colors duration-300">Challenges</Link>
          <Link href="/about" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-300">Builders</Link>
          <Link href="#" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-300">Solutions</Link>
          <Link href="#" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-300">Leaderboard</Link>
        </nav>
        
        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-300">Dashboard</Link>
              {role === "company" && (
                <Link href="/organizations/new" className="btn-primary px-6 py-2 rounded-lg font-body-md font-medium active:scale-95 transition-transform">
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
              <SignInButton mode="modal">
                <button className="text-on-surface-variant font-body-md hover:text-secondary transition-colors duration-300">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary px-6 py-2 rounded-lg font-body-md font-medium active:scale-95 transition-transform">Get Started</button>
              </SignUpButton>
            </>
          )}
        </div>
        
        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-on-surface p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0c1324]/95 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          <Link href="/" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors py-2 border-b border-white/5" onClick={() => setMobileOpen(false)}>Challenges</Link>
          <Link href="/about" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors py-2 border-b border-white/5" onClick={() => setMobileOpen(false)}>Builders</Link>
          
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="text-on-surface-variant font-body-md hover:text-secondary transition-colors py-2 border-b border-white/5" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              {role === "company" && (
                <Link href="/organizations/new" className="text-primary font-body-md hover:text-secondary transition-colors py-2 border-b border-white/5" onClick={() => setMobileOpen(false)}>Post Challenge</Link>
              )}
              <div className="pt-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <div className="flex gap-4 pt-2">
              <SignInButton mode="modal">
                <button className="btn-secondary px-4 py-2 rounded-lg flex-1">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary px-4 py-2 rounded-lg flex-1">Get Started</button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
