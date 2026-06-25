import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NavBar } from "@/components/NavBar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
          {/* Ambient background orbs */}
          <div className="bg-orb-1" aria-hidden="true" />
          <div className="bg-orb-2" aria-hidden="true" />

          <div style={{ position: "relative", zIndex: 1 }}>
            <NavBar />
            <main
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 24px 80px",
              }}
            >
              {children}
            </main>

            <footer
              style={{
                borderTop: "1px solid var(--border)",
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  maxWidth: "1200px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  OpenSolve
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                  Connecting student talent with real-world challenges from YC, government, and industry.
                </p>
                <div style={{ display: "flex", gap: "24px" }}>
                  {[
                    { href: "/about", label: "About" },
                    { href: "/privacy", label: "Privacy" },
                    { href: "/terms", label: "Terms" },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        textDecoration: "none",
                        fontSize: "0.8125rem",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  © {new Date().getFullYear()} OpenSolve. Built for the AWS + Vercel H0 Hackathon.
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
