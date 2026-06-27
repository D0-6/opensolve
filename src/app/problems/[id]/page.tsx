import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, Users, Tag, Globe, Lock } from "lucide-react";
import Link from "next/link";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string }> = {
  YC_STARTUP: { label: "YC Startup" },
  GOVERNMENT: { label: "Government" },
  INDUSTRY: { label: "Industry" },
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", NL: "Netherlands",
  SG: "Singapore", AE: "UAE", BR: "Brazil", NG: "Nigeria",
  KE: "Kenya", ZA: "South Africa", PK: "Pakistan", BD: "Bangladesh",
  PH: "Philippines", ID: "Indonesia", MY: "Malaysia",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);
  if (!problem) return { title: "Challenge Not Found | OpenSolve" };

  return {
    title: `${problem.title} | OpenSolve Hiring Challenge`,
    description: (problem.description || "").substring(0, 160) + "...",
  };
}

export default async function ProblemDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  if (!problem) notFound();

  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;
  const isCountryRestricted = Array.isArray(problem.allowedCountries) && problem.allowedCountries.length > 0;

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
        "addressLocality": isCountryRestricted ? "Selected Countries" : "Remote / Global"
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

      {/* Country restriction banner */}
      {isCountryRestricted && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3.5 mb-8 text-sm font-medium">
          <Lock size={16} className="shrink-0" />
          <span>
            This challenge is open only to residents of:{" "}
            <strong>
              {(problem.allowedCountries as string[]).map(c => COUNTRY_NAMES[c] || c).join(", ")}
            </strong>
          </span>
        </div>
      )}

      {/* Problem header */}
      <div className="mb-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold">
              {cfg.label} {problem.verified && "· Verified"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold">
              {problem.domain}
            </span>
            {typeof problem.maxTeamSize === "number" && (
              <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold flex items-center gap-1">
                <Users size={11} /> Team up to {problem.maxTeamSize}
              </span>
            )}
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
                : problem.prizeType?.replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold block mb-1">Deadline</span>
            <span className="font-medium text-zinc-900">
              {new Date(problem.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div>
            <span className="text-zinc-400 uppercase tracking-wider text-xs font-bold block mb-1">Eligibility</span>
            <span className="font-medium text-zinc-900 flex items-center gap-1.5">
              {isCountryRestricted ? (
                <><Lock size={13} className="text-amber-500" /> Country Restricted</>
              ) : (
                <><Globe size={13} className="text-zinc-400" /> Global / Remote</>
              )}
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

        {/* Description */}
        <div className="prose prose-zinc max-w-none border-t border-zinc-200 pt-8">
          <p className="text-base md:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {/* Success criteria / requirements */}
        {problem.requirements && (
          <div className="mt-8 bg-zinc-50 border border-zinc-200 p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Success Criteria</h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{problem.requirements}</p>
          </div>
        )}

        {/* Required skills */}
        {Array.isArray(problem.requiredSkills) && problem.requiredSkills.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
              <Tag size={13} /> Required Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {(problem.requiredSkills as string[]).map(skill => (
                <span key={skill} className="text-xs font-bold text-zinc-700 bg-white border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resource Links */}
        {Array.isArray(problem.resourceLinks) && problem.resourceLinks.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Resources & Datasets</div>
            <div className="flex flex-col gap-2">
              {(problem.resourceLinks as string[]).map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1a3a5c] hover:underline flex items-center gap-1.5 font-mono"
                >
                  <ExternalLink size={13} /> {link}
                </a>
              ))}
            </div>
          </div>
        )}
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
