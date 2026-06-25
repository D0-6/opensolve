import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink, CalendarDays, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  YC_STARTUP: { label: "YC Startup", color: "#fb923c", bg: "rgba(249,115,22,0.12)" },
  GOVERNMENT: { label: "Government", color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
  INDUSTRY: { label: "Industry", color: "rgba(255,255,255,0.55)", bg: "rgba(255,255,255,0.06)" },
};

export default async function ProblemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) notFound();

  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;

  return (
    <div style={{ paddingTop: "32px" }}>
      {/* Back link */}
      <Link
        href="/"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "24px", transition: "color 0.2s" }}
      >
        <ArrowLeft size={14} /> Back to Problems
      </Link>

      {/* Problem header card */}
      <div
        className="glass"
        style={{ borderRadius: "24px", padding: "36px", marginBottom: "32px", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.color}30`,
                borderRadius: "100px",
                padding: "4px 12px",
                fontSize: "0.75rem",
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
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "8px" }}>
              {problem.domain}
            </span>
          </div>

          <Link
            href={`/problems/${problem.problemId}/submit`}
            className="btn-primary"
            style={{ padding: "12px 28px", borderRadius: "14px", whiteSpace: "nowrap" }}
          >
            Submit Solution →
          </Link>
        </div>

        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, lineHeight: 1.2, marginBottom: "20px" }}>
          {problem.title}
        </h1>

        <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: "28px" }}>
          {problem.description}
        </p>

        {/* Meta row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Trophy size={16} style={{ color: "#facc15" }} />
            <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
              {problem.prizeType === "CASH"
                ? `$${Number(problem.prizeAmount).toLocaleString()} Prize`
                : problem.prizeType?.replace("_", " ")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.45)" }}>
            <CalendarDays size={16} />
            <span style={{ fontSize: "0.875rem" }}>
              Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {problem.sourceUrl && (
            <a
              href={problem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "#818cf8", textDecoration: "none" }}
            >
              <ExternalLink size={14} /> View Original Source
            </a>
          )}
        </div>
      </div>

      {/* Leaderboard + QA */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="lg:grid-cols-3">
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px" }}>Leaderboard</h2>
          <ClientLeaderboard problemId={problem.problemId} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px" }}>Q&amp;A Thread</h2>
          <ClientQA problemId={problem.problemId} />
        </div>
      </div>
    </div>
  );
}
