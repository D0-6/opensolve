"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Zap, LayoutDashboard, PlusCircle, Menu, X } from "lucide-react";
import { useState } from "react";

export function NavBar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        background: "var(--nav-bg)0.8)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={18} color="white" />
          </div>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            OpenSolve
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="hidden md:flex"
        >
          <NavLink href="/">Problems</NavLink>
          <NavLink href="/about">About</NavLink>

          {isLoaded && isSignedIn && (
            <>
              <NavLink href="/dashboard">
                <LayoutDashboard size={14} style={{ display: "inline", marginRight: "4px" }} />
                Dashboard
              </NavLink>
              {role === "company" && (
                <Link
                  href="/organizations/new"
                  className="btn-primary"
                  style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.8125rem" }}
                >
                  <PlusCircle size={14} />
                  Post Challenge
                </Link>
              )}
              <div style={{ marginLeft: "4px" }}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button
                  className="btn-secondary"
                  style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.8125rem" }}
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="btn-primary"
                  style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "0.8125rem" }}
                >
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            background: "var(--nav-bg)0.95)",
            borderTop: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          className="md:hidden"
        >
          <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>Problems</MobileNavLink>
          <MobileNavLink href="/about" onClick={() => setMobileOpen(false)}>About</MobileNavLink>
          {isLoaded && isSignedIn && (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
              {role === "company" && (
                <MobileNavLink href="/organizations/new" onClick={() => setMobileOpen(false)}>Post a Challenge</MobileNavLink>
              )}
              <div style={{ paddingTop: "8px" }}>
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          )}
          
          {isLoaded && !isSignedIn && (
            <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
              <SignInButton mode="modal">
                <button className="btn-secondary" style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary" style={{ flex: 1, padding: "10px", borderRadius: "10px" }}>Sign Up</button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--text-secondary)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: "8px",
        transition: "color 0.2s ease, background 0.2s ease",
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.color = "rgba(255,255,255,0.9)";
        (e.target as HTMLElement).style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)";
        (e.target as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        color: "var(--text-secondary)",
        textDecoration: "none",
        fontSize: "0.9375rem",
        fontWeight: 500,
        padding: "10px 0",
        borderBottom: "1px solid var(--surface)",
        display: "block",
      }}
    >
      {children}
    </Link>
  );
}
