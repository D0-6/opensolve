import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { Trophy, GitBranch, Globe, ExternalLink, Activity, ArrowRight, Upload, Briefcase, FileText, Lock, Users, Target, ShieldCheck, Tag, ArrowLeft, Megaphone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { getDocClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";
import AnnouncementsPanel from "./AnnouncementsPanel";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string }> = {
  YC_STARTUP: { label: "YC Startup" },
  GOVERNMENT: { label: "Government" },
  INDUSTRY: { label: "Industry" },
  COMMUNITY: { label: "Community Scouts" },
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

  // Validate if scout profile still exists
  let scoutExists = false;
  if (problem.scoutId) {
    try {
      const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
      const scoutRes = await getDocClient().send(new GetCommand({
        TableName: PROFILES_TABLE,
        Key: { userId: problem.scoutId }
      }));
      scoutExists = !!scoutRes.Item;
    } catch (err) {
      console.error("Error validating scout profile:", err);
    }
  }

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
        href="/challenges"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm mb-8 transition-colors font-medium"
      >
        <ArrowLeft size={16} /> Back to Challenges
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

      {/* Scout / Discovered By banner */}
      {problem.scoutId && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 text-purple-800 px-5 py-3.5 mb-8 text-sm font-medium">
          <div className="flex items-center gap-3">
            <span className="text-xl">🕵️</span>
            <div className="flex flex-col">
              <span>
                This challenge was discovered and shared by community scout <strong>{String(problem.scoutName || "Anonymous")}</strong>.
              </span>
              {problem.scoutBountyPercent && (
                <span className="text-purple-600 text-xs mt-0.5 font-normal">
                  They will earn a {String(problem.scoutBountyPercent)}% finder's fee if an OpenSolve builder wins this bounty.
                </span>
              )}
            </div>
          </div>
          {scoutExists ? (
            <Link href={`/profile/${problem.scoutId}`} className="text-purple-700 hover:text-purple-900 underline underline-offset-2">
              View Profile
            </Link>
          ) : (
            <span className="text-purple-400 italic text-xs">Profile Unavailable</span>
          )}
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
            href={`/problems/${problem.problemId}/apply`}
            className="btn-primary w-full md:w-auto text-center px-6 py-2.5 font-medium text-sm"
          >
            Apply to Work
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
            {problem.prizeType === "CASH" && problem.prizeAmount > 0 && (
              <div className="text-[10px] text-zinc-400 mt-0.5">
                99.5% to winner, 0.5% platform fee
              </div>
            )}
            {Array.isArray(problem.prizeBreakdown) && problem.prizeBreakdown.length > 0 && (
              <div className="mt-2 space-y-1">
                {(problem.prizeBreakdown as any[]).map((prize, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-500">{prize.place}:</span>
                    <span className="text-zinc-700">${Number(prize.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
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
        <div className="prose prose-zinc prose-a:text-purple-600 prose-headings:text-zinc-900 max-w-none border-t border-zinc-200 pt-8 mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.description || "No description provided."}
          </ReactMarkdown>
        </div>

        {/* Success criteria / requirements */}
        {problem.requirements && (
          <div className="mt-8 bg-zinc-50 border border-zinc-200 p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Success Criteria</h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{problem.requirements}</p>
          </div>
        )}

        {/* Judging Criteria */}
        {problem.judgingCriteria && (
          <div className="mt-6 bg-zinc-50 border border-zinc-200 p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Judging Criteria</h3>
            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{problem.judgingCriteria}</p>
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
        <div className="space-y-8">
          {/* Announcements (Devpost-style challenge updates) */}
          <AnnouncementsPanel
            problemId={problem.problemId}
            announcements={Array.isArray(problem.announcements) ? problem.announcements as any[] : []}
          />
          <div>
            <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2">Community &amp; Mentorship</h2>
            
            {/* Discord / Community URL CTA */}
            {problem.communityUrl && (
              <div className="bg-[#1a3a5c]/5 border border-[#1a3a5c]/20 p-5 mb-6 text-sm">
                <div className="font-semibold text-[#1a3a5c] mb-2 flex items-center gap-2">
                  <Megaphone size={16} /> Connect with the Organization
                </div>
                <p className="text-zinc-700 mb-4 leading-relaxed">
                  Join the community space to ask questions, get mentorship, and interact directly with professionals reviewing this challenge.
                </p>
                <a
                  href={problem.communityUrl as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block text-center px-4 py-2 font-medium"
                >
                  Join Community
                </a>
              </div>
            )}

            <ClientQA problemId={problem.problemId} />
          </div>
        </div>
      </div>
    </div>
  );
}
