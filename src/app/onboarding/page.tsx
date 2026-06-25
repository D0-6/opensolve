"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"student" | "company" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(var(--accent-rgb),0.12)",
            border: "1px solid rgba(var(--accent-rgb),0.25)",
            borderRadius: "100px",
            padding: "6px 16px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent)",
            marginBottom: "20px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          One Last Step
        </div>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            marginBottom: "12px",
            lineHeight: 1.2,
          }}
        >
          How will you use{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            OpenSolve?
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: "400px" }}>
          This helps us personalize your experience and show you the right content.
        </p>
      </div>

      {/* Role cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "600px",
          marginBottom: "32px",
        }}
      >
        <RoleCard
          icon={<GraduationCap size={36} />}
          title="I'm a Student / Builder"
          description="Browse real challenges from YC startups, governments, and companies. Submit solutions and get hired or win prizes."
          bullets={["Browse & solve funded challenges", "Build a verifiable portfolio", "Get hired or win prizes"]}
          selected={selected === "student"}
          onClick={() => setSelected("student")}
          accent="var(--accent)"
        />
        <RoleCard
          icon={<Building2 size={36} />}
          title="I'm a Company / Org"
          description="Post real challenges to thousands of motivated builders. Find top talent and view ranked, verifiable solutions."
          bullets={["Post challenges & find talent", "View ranked submissions", "Contact top performers"]}
          selected={selected === "company"}
          onClick={() => setSelected("company")}
          accent="var(--accent-2)"
        />
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="btn-primary"
        style={{
          padding: "14px 40px",
          borderRadius: "14px",
          fontSize: "1rem",
          opacity: selected ? 1 : 0.4,
          cursor: selected ? "pointer" : "not-allowed",
          minWidth: "200px",
        }}
      >
        {loading ? (
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <>
            Continue <ArrowRight size={18} />
          </>
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  description,
  bullets,
  selected,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  selected: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
          : "rgba(255,255,255,0.03)",
        border: `2px solid ${selected ? accent : "rgba(255,255,255,0.08)"}`,
        borderRadius: "20px",
        padding: "28px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.25s ease",
        transform: selected ? "translateY(-2px)" : "none",
        boxShadow: selected ? `0 12px 40px ${accent}25` : "none",
        width: "100%",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "16px",
          background: `${accent}20`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          marginBottom: "8px",
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "16px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
        {bullets.map((b) => (
          <li
            key={b}
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: accent, fontSize: "0.625rem" }}>●</span>
            {b}
          </li>
        ))}
      </ul>
    </button>
  );
}
