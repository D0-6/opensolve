import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink, CalendarDays, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  YC_STARTUP: { label: "YC Startup", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  GOVERNMENT: { label: "Government", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  INDUSTRY: { label: "Industry", color: "text-white/70", bg: "bg-white/5 border-white/10" },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);
  if (!problem) return { title: "Challenge Not Found | OpenSolve" };
  
  return {
    title: `${problem.title} | OpenSolve Hiring Challenge`,
    description: problem.description.substring(0, 160) + "...",
  };
}

export default async function ProblemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) notFound();

  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": problem.title,
    "description": problem.description,
    "datePosted": problem.postedAt || new Date().toISOString(),
    "validThrough": problem.deadline,
    "employmentType": problem.prizeType === "HIRING" ? "FULL_TIME" : "CONTRACTOR",
    "hiringOrganization": {
      "@type": "Organization",
      "name": problem.source === "INDUSTRY" ? "Enterprise Partner" : "Startup Partner",
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Remote"
      }
    }
  };

  return (
    <div className="pt-8 pb-16 max-w-7xl mx-auto px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#8990a8] hover:text-[#dce1fb] text-sm mb-6 transition-colors font-semibold"
      >
        <ArrowLeft size={16} /> Back to Problems
      </Link>

      {/* Problem header card */}
      <div className="bg-[#0c1324] border border-[#00cbe6]/30 shadow-[0_0_40px_rgba(0,203,230,0.05)] rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-radial-gradient from-[#00cbe6]/10 to-transparent blur-3xl rounded-full" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${cfg.bg} ${cfg.color}`}
            >
              {cfg.label}
              {problem.verified && <BadgeCheck size={14} />}
            </span>
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-white/50 border border-white/10">
              {problem.domain}
            </span>
          </div>

          <Link
            href={`/problems/${problem.problemId}/submit`}
            className="w-full md:w-auto text-center bg-[#00cbe6] text-[#020617] font-bold px-8 py-3 rounded-xl hover:bg-[#5de6ff] transition-all shadow-[0_0_20px_rgba(0,203,230,0.3)] hover:shadow-[0_0_30px_rgba(0,203,230,0.5)]"
          >
            Submit Solution →
          </Link>
        </div>

        <h1 className="text-3xl md:text-5xl font-display-lg font-bold text-[#dce1fb] leading-tight mb-6">
          {problem.title}
        </h1>

        <p className="text-base md:text-lg text-[#8990a8] leading-relaxed mb-8 whitespace-pre-wrap">
          {problem.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 text-[#dce1fb] font-bold">
            <Trophy size={18} className="text-[#facc15]" />
            <span>
              {problem.prizeType === "CASH"
                ? `$${Number(problem.prizeAmount).toLocaleString()} Prize`
                : problem.prizeType?.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#8990a8] font-medium text-sm">
            <CalendarDays size={18} />
            <span>
              Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {problem.sourceUrl && (
            <a
              href={problem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold text-[#00cbe6] hover:text-[#5de6ff] transition-colors ml-auto md:ml-0"
            >
              <ExternalLink size={16} /> View Original Source
            </a>
          )}
        </div>
      </div>

      {/* Leaderboard + QA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-[#dce1fb] mb-6 flex items-center gap-2">Leaderboard</h2>
          <ClientLeaderboard problemId={problem.problemId} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#dce1fb] mb-6 flex items-center gap-2">Q&amp;A Thread</h2>
          <ClientQA problemId={problem.problemId} />
        </div>
      </div>
    </div>
  );
}
