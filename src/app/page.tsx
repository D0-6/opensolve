import { getProblems } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import {
  BadgeCheck,
  Clock,
  Trophy,
  ArrowRight,
  Zap,
  Users,
  DollarSign,
  Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  YC_STARTUP: { label: "YC Startup", badgeClass: "badge-yc" },
  GOVERNMENT: { label: "Government", badgeClass: "badge-gov" },
  INDUSTRY: { label: "Industry", badgeClass: "badge-industry" },
};

function ProblemCard({ problem }: { problem: any }) {
  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;
  const hoursLeft = differenceInHours(new Date(problem.deadline), new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft < 72;
  const isPast = hoursLeft <= 0;

  return (
    <Link href={`/problems/${problem.problemId}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <div
        className="glass card-hover"
        style={{
          borderRadius: "20px",
          padding: "24px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        {/* Top row: badge + deadline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span
            className={cfg.badgeClass}
            style={{
              padding: "4px 10px",
              borderRadius: "100px",
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {cfg.label}
            {problem.verified && <BadgeCheck size={11} />}
          </span>

          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: isPast
                ? "rgba(255,255,255,0.25)"
                : isUrgent
                ? "#ef4444"
                : "#22c55e",
            }}
          >
            <Clock size={12} />
            {isPast ? "Closed" : formatDistanceToNow(new Date(problem.deadline), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.9)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {problem.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {problem.description}
        </p>

        {/* Bottom: prize + domain */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Trophy size={14} style={{ color: "#facc15" }} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
              {problem.prizeAmount > 0
                ? `$${problem.prizeAmount.toLocaleString()}`
                : problem.prizeType?.replace("_", " ")}
            </span>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.05)",
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            {problem.domain}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { source?: string; domain?: string };
}) {
  const sp = await searchParams;
  const problems = await getProblems(sp.source, sp.domain);

  const totalPrize = problems.reduce((sum: number, p: any) => sum + (p.prizeAmount || 0), 0);

  const sources = [
    { label: "All", value: undefined },
    { label: "YC Startups", value: "YC_STARTUP" },
    { label: "Government", value: "GOVERNMENT" },
    { label: "Industry", value: "INDUSTRY" },
  ];

  return (
    <div>
      {/* ─── HERO ─── */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 0 64px",
          position: "relative",
        }}
      >
        {/* Pill badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.22)",
            borderRadius: "100px",
            padding: "6px 16px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#818cf8",
            marginBottom: "28px",
            letterSpacing: "0.04em",
          }}
        >
          <Zap size={12} />
          Real Challenges · Real Rewards · Real Careers
        </div>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            maxWidth: "800px",
            margin: "0 auto 24px",
          }}
        >
          Where Builders Meet{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Real Opportunities
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.1875rem)",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Solve funded challenges from YC startups, government innovation programs, and top companies.
          Build your portfolio. Get hired. Win prizes.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#problems"
            className="btn-primary"
            style={{ padding: "14px 32px", borderRadius: "14px", fontSize: "1rem" }}
          >
            <Search size={18} /> Browse Problems
          </a>
          <Link
            href="/organizations/new"
            className="btn-secondary"
            style={{ padding: "14px 32px", borderRadius: "14px", fontSize: "1rem" }}
          >
            Post a Challenge <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "64px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          { icon: <Zap size={20} style={{ color: "#818cf8" }} />, value: `${problems.length}+`, label: "Active Challenges" },
          { icon: <DollarSign size={20} style={{ color: "#22d3ee" }} />, value: totalPrize > 0 ? `$${(totalPrize / 1000).toFixed(0)}k+` : "Varied", label: "In Prizes" },
          { icon: <Users size={20} style={{ color: "#a78bfa" }} />, value: "Open", label: "To All Builders" },
          { icon: <BadgeCheck size={20} style={{ color: "#22c55e" }} />, value: "Verified", label: "Real Problems" },
        ].map(({ icon, value, label }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
              padding: "28px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {icon}
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{value}</div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>{label}</div>
          </div>
        ))}
      </section>

      {/* ─── PROBLEMS SECTION ─── */}
      <section id="problems" style={{ scrollMarginTop: "80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Active Challenges</h2>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {sources.map(({ label, value }) => {
              const isActive = sp.source === value || (!sp.source && !value);
              const href = value ? `/?source=${value}` : "/";
              return (
                <Link
                  key={label}
                  href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "100px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    background: isActive ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    color: isActive ? "#818cf8" : "rgba(255,255,255,0.5)",
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {problems.length === 0 ? (
          <div
            className="glass"
            style={{ borderRadius: "20px", padding: "60px", textAlign: "center", color: "rgba(255,255,255,0.35)" }}
          >
            <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>No challenges found</p>
            <p style={{ fontSize: "0.875rem" }}>Check back later or try a different filter</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {problems.map((problem: any) => (
              <ProblemCard key={problem.problemId} problem={problem} />
            ))}
          </div>
        )}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ marginTop: "96px", marginBottom: "32px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "12px" }}>
            How OpenSolve Works
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>
            A transparent pipeline from challenge to career
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {/* Student flow */}
          <div className="glass" style={{ borderRadius: "20px", padding: "32px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
              For Students & Builders
            </div>
            {[
              { step: "01", title: "Browse Challenges", desc: "Filter by domain, prize type, or source. Find problems that match your skills." },
              { step: "02", title: "Submit Your Solution", desc: "Share your GitHub repo + writeup. Your solution is public and verifiable." },
              { step: "03", title: "Get Hired or Win", desc: "Top submissions get contacted directly by companies for jobs or contracts." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(99,102,241,0.7)", minWidth: "28px", paddingTop: "2px" }}>{step}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "0.9375rem" }}>{title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Company flow */}
          <div className="glass" style={{ borderRadius: "20px", padding: "32px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
              For Companies & Orgs
            </div>
            {[
              { step: "01", title: "Post a Challenge", desc: "Describe your problem, set a prize, and publish. We surface it to thousands of builders." },
              { step: "02", title: "Review Submissions", desc: "All solutions are ranked by score. View GitHub repos, demos, and writeups at a glance." },
              { step: "03", title: "Contact Top Talent", desc: "Reach out to your top performers directly. Hire, contract, or pilot their solution." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(139,92,246,0.7)", minWidth: "28px", paddingTop: "2px" }}>{step}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "4px", fontSize: "0.9375rem" }}>{title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
