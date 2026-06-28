import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { GitBranch, Play, Trophy, ExternalLink, Layers } from "lucide-react";

export const revalidate = 60; // Regenerate at most once per minute

export const metadata = {
  title: "Solutions Gallery | OpenSolve",
  description: "Browse publicly submitted solutions by builders who have tackled real challenges from companies, startups and government.",
};

const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export default async function SolutionsPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParams;
  const domainFilter = sp.domain;
  const startKeyParam = sp.startKey;

  let allSubmissions: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined = undefined;

  try {
    let exclusiveStartKey = undefined;
    if (typeof startKeyParam === "string") {
      try {
        exclusiveStartKey = JSON.parse(Buffer.from(startKeyParam, "base64url").toString("utf-8"));
      } catch (e) {
        console.error("Failed to parse startKey:", e);
      }
    }

    const res = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: "entityType-score-index",
      KeyConditionExpression: "entityType = :type",
      ExpressionAttributeValues: { ":type": "SUBMISSION" },
      ScanIndexForward: false, // Sort descending by score natively in DynamoDB!
      Limit: 50,
      ExclusiveStartKey: exclusiveStartKey,
    }));
    allSubmissions = res.Items || [];
    lastEvaluatedKey = res.LastEvaluatedKey;
  } catch (err: unknown) {
    console.error("[CRITICAL] Solutions gallery query error:", err instanceof Error ? err.message : err);
  }

  // We no longer need to manually sort by score since the GSI handles it natively!
  // We only fallback sort by submittedAt if scores are perfectly equal.
  allSubmissions.sort((a, b) => {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return String(b.submittedAt || "").localeCompare(String(a.submittedAt || ""));
  });

  // Fetch problem titles for unique problemIds
  const problemIds = [...new Set(allSubmissions.map(s => String(s.problemId)))];
  const problemCache: Record<string, Record<string, unknown>> = {};

  const top50ProblemIds = problemIds.slice(0, 50);
  if (top50ProblemIds.length > 0) {
    try {
      const res = await docClient.send(new BatchGetCommand({
        RequestItems: {
          [PROBLEMS_TABLE]: {
            Keys: top50ProblemIds.map(pid => ({ problemId: pid }))
          }
        }
      }));
      const fetchedProblems = res.Responses?.[PROBLEMS_TABLE] || [];
      for (const p of fetchedProblems) {
        problemCache[p.problemId as string] = p;
      }
    } catch (err) {
      console.error("BatchGetCommand error for problems:", err);
    }
  }

  // Apply domain filter
  const filtered = domainFilter
    ? allSubmissions.filter(s => problemCache[String(s.problemId)]?.domain === domainFilter)
    : allSubmissions;

  // Collect all unique domains for filter tabs
  const allDomains = [...new Set(
    Object.values(problemCache).map(p => String(p.domain || "")).filter(Boolean)
  )].sort();

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="w-full max-w-[125rem] mx-auto">

        {/* Header */}
        <div className="mb-12 border-b border-zinc-200 pb-12">
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-6">
            <Layers size={14} /> Solutions Gallery
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-3">
            Public Solutions
          </h1>
          <p className="text-zinc-500 text-base max-w-xl">
            Browse real solutions submitted by builders tackling real problems from companies, startups, and government. Ranked by quality score.
          </p>
        </div>

        {/* Domain filter tabs */}
        {allDomains.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/solutions"
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                !domainFilter
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              All ({allSubmissions.length})
            </Link>
            {allDomains.map(domain => {
              const count = allSubmissions.filter(s => problemCache[String(s.problemId)]?.domain === domain).length;
              return (
                <Link
                  key={domain}
                  href={`/solutions?domain=${encodeURIComponent(domain)}`}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                    domainFilter === domain
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  {domain} ({count})
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="border border-dashed border-zinc-200 p-20 text-center">
            <Layers size={40} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-zinc-500 font-medium">No solutions yet.</p>
            <p className="text-zinc-400 text-sm mt-1">Apply to a challenge and submit the first solution!</p>
            <Link href="/challenges" className="btn-primary inline-block mt-6 px-6 py-2.5 text-sm">Browse Challenges</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(sub => {
              const problem = problemCache[String(sub.problemId)];
              const evalStatus = sub.evaluationStatus as string;
              const hasOffer = ["HIRED", "CONTRACT_OFFERED", "INTERVIEW_REQUESTED"].includes(evalStatus);
              const teamMembers = Array.isArray(sub.teamMembers) ? sub.teamMembers : [];

              return (
                <div key={`${sub.problemId}-${sub.submittedAt}`} className="border border-zinc-200 bg-white flex flex-col hover:border-[#1a3a5c] transition-colors group">
                  {/* Score badge */}
                  <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        Number(sub.score) >= 80 ? "bg-green-100 text-green-700 border border-green-200" :
                        Number(sub.score) >= 50 ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        "bg-zinc-100 text-zinc-600 border border-zinc-200"
                      }`}>
                        {Number(sub.score) || "—"}
                      </div>
                      {hasOffer && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                          evalStatus === "HIRED" ? "bg-green-100 text-green-700" :
                          evalStatus === "CONTRACT_OFFERED" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-50 text-yellow-700"
                        }`}>
                          {evalStatus.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy size={13} className="text-zinc-300" />
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Score</span>
                    </div>
                  </div>

                  <div className="flex-1 px-6 py-5">
                    {/* Problem title */}
                    {problem && (
                      <Link href={`/problems/${sub.problemId}`} className="block mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">{String(problem.domain || "")}</span>
                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-[#1a3a5c] transition-colors line-clamp-2">
                          {String(problem.title)}
                        </span>
                      </Link>
                    )}

                    {/* Builder info */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                        {String(sub.studentName || "?").charAt(0).toUpperCase()}
                      </div>
                      <Link href={`/profile/${sub.userId}`} className="text-sm font-medium text-zinc-900 hover:text-[#1a3a5c] transition-colors truncate">
                        {String(sub.studentName || "Anonymous")}
                      </Link>
                      {teamMembers.length > 0 && (
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                          +{teamMembers.length}
                        </span>
                      )}
                    </div>

                    {/* Writeup */}
                    <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                      {String(sub.writeup || "")}
                    </p>
                  </div>

                  {/* Footer links */}
                  <div className="px-6 pb-5 flex items-center gap-4 border-t border-zinc-100 pt-4">
                    <a
                      href={String(sub.githubUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                      onClick={e => e.stopPropagation()}
                    >
                      <GitBranch size={13} /> Repository
                    </a>
                    {Boolean(sub.demoUrl) && (
                      <a
                        href={String(sub.demoUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                        onClick={e => e.stopPropagation()}
                      >
                        <Play size={13} /> Live Demo
                      </a>
                    )}
                    <span className="ml-auto text-[10px] text-zinc-400">
                      {new Date(String(sub.submittedAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lastEvaluatedKey && (
          <div className="mt-12 text-center border-t border-zinc-200 pt-8">
            <Link
              href={`/solutions?${domainFilter ? `domain=${encodeURIComponent(domainFilter)}&` : ""}startKey=${Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64url")}`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              <Layers size={16} /> Load More
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
