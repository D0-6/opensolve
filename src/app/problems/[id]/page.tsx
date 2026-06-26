import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string }> = {
  YC_STARTUP: { label: "YC Startup" },
  GOVERNMENT: { label: "Government" },
  INDUSTRY: { label: "Industry" },
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
    <div className="pt-24 pb-16 w-full max-w-[125rem] mx-auto px-6 bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm mb-8 transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to Directory
      </Link>

      {/* Problem header (Editorial, no card) */}
      <div className="mb-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold">
              {cfg.label} {problem.verified && "· Verified"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold">
              {problem.domain}
            </span>
          </div>

          <Link
            href={`/problems/${problem.problemId}/submit`}
            className="btn-primary w-full md:w-auto text-center px-6 py-2.5 font-medium text-sm"
          >
            Submit Solution
          </Link>
        </div>

        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight mb-6">
          {problem.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-8 text-sm">
          <div>
            <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold block mb-1">Prize</span>
            <span className="font-medium text-zinc-900">
              {problem.prizeType === "CASH"
                ? `$${Number(problem.prizeAmount).toLocaleString()}`
                : problem.prizeType?.replace("_", " ")}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold block mb-1">Deadline</span>
            <span className="font-medium text-zinc-900">
              {new Date(problem.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {problem.sourceUrl && (
            <div>
              <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold block mb-1">Reference</span>
              <a
                href={problem.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-medium text-zinc-900 hover:text-[#1a3a5c] transition-colors"
              >
                View Original <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        <div className="prose prose-zinc max-w-none border-t border-zinc-200 pt-8">
          <p className="text-base md:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>
      </div>

      {/* Leaderboard + QA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-zinc-200 pt-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2">Leaderboard</h2>
          <ClientLeaderboard problemId={problem.problemId} />
        </div>
        <div>
          <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2">Q&amp;A Thread</h2>
          <ClientQA problemId={problem.problemId} />
        </div>
      </div>
    </div>
  );
}
