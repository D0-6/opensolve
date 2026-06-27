import { docClient } from "@/lib/dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { Trophy, GitBranch, Globe, ExternalLink, Medal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Global Builder Leaderboard | OpenSolve",
  description: "See the top builders and teams on OpenSolve, ranked by cumulative solution score across all challenges.",
};

const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export default async function LeaderboardPage() {
  // Scan all submissions and aggregate scores by userId
  let allSubmissions: Record<string, unknown>[] = [];
  try {
    const res = await docClient.send(new ScanCommand({ TableName: SUBMISSIONS_TABLE }));
    allSubmissions = res.Items || [];
  } catch (err) {
    console.error("Leaderboard scan error:", err);
  }

  // Aggregate: userId → { totalScore, submissionCount, bestScore, problems: Set }
  const aggregated: Record<string, {
    userId: string;
    totalScore: number;
    submissionCount: number;
    bestScore: number;
    uniqueProblems: number;
    problemIds: Set<string>;
    studentName: string;
  }> = {};

  for (const sub of allSubmissions) {
    const uid = sub.userId as string;
    const score = Number(sub.score) || 0;
    const name = sub.studentName as string || "Anonymous";
    if (!aggregated[uid]) {
      aggregated[uid] = {
        userId: uid,
        totalScore: 0,
        submissionCount: 0,
        bestScore: 0,
        uniqueProblems: 0,
        problemIds: new Set(),
        studentName: name,
      };
    }
    aggregated[uid].totalScore += score;
    aggregated[uid].submissionCount += 1;
    aggregated[uid].bestScore = Math.max(aggregated[uid].bestScore, score);
    aggregated[uid].problemIds.add(sub.problemId as string);
    aggregated[uid].uniqueProblems = aggregated[uid].problemIds.size;
    // Keep most recent name
    aggregated[uid].studentName = name;
  }

  // Sort by totalScore descending
  const ranked = Object.values(aggregated)
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100); // top 100

  // Fetch profiles for top 100 to get GitHub/country
  const profileIds = ranked.slice(0, 20).map(r => r.userId);
  const profiles: Record<string, Record<string, unknown>> = {};

  for (const uid of profileIds) {
    try {
      const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
      const res = await docClient.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { userId: uid } }));
      if (res.Item) profiles[uid] = res.Item;
    } catch (err) {
      console.error(err);
    }
  }

  const medalColors = ["text-yellow-500", "text-zinc-400", "text-amber-700"];

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="w-full max-w-[125rem] mx-auto">

        {/* Header */}
        <div className="mb-12 border-b border-zinc-200 pb-12">
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-6">
            <Trophy size={14} /> Global Rankings
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-3">
            Builder Leaderboard
          </h1>
          <p className="text-zinc-500 text-base max-w-xl">
            Ranked by cumulative score across all challenges. Each submission is auto-scored and the best builders rise to the top.
          </p>
        </div>

        {ranked.length === 0 ? (
          <div className="border border-dashed border-zinc-200 p-20 text-center">
            <Trophy size={40} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-zinc-500 font-medium">No submissions yet.</p>
            <p className="text-zinc-400 text-sm mt-1">Be the first to solve a challenge and claim your spot.</p>
            <Link href="/challenges" className="btn-primary inline-block mt-6 px-6 py-2.5 text-sm">Browse Challenges</Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranked.length >= 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {ranked.slice(0, 3).map((builder, i) => {
                  const profile = profiles[builder.userId];
                  return (
                    <Link
                      key={builder.userId}
                      href={`/profile/${builder.userId}`}
                      className={`border p-8 flex flex-col items-center text-center hover:border-[#1a3a5c] transition-colors group ${
                        i === 0 ? "border-yellow-300 bg-yellow-50 order-first md:order-2" :
                        i === 1 ? "border-zinc-300 bg-zinc-50 order-2 md:order-1" :
                        "border-amber-200 bg-amber-50 order-3"
                      }`}
                    >
                      <Medal size={28} className={`mb-4 ${medalColors[i]}`} />
                      <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center text-[#1a3a5c] text-3xl font-bold mb-4 rounded-full">
                        {builder.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-zinc-900 text-lg group-hover:text-[#1a3a5c] transition-colors">
                        {builder.studentName}
                      </div>
                      {profile?.country && (
                        <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                          <Globe size={11} /> {String(profile.country)}
                        </div>
                      )}
                      <div className="mt-4 text-3xl font-bold text-zinc-900">{builder.totalScore}</div>
                      <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mt-1">Total Score</div>
                      <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                        <span>{builder.submissionCount} submission{builder.submissionCount !== 1 ? "s" : ""}</span>
                        <span>{builder.uniqueProblems} problem{builder.uniqueProblems !== 1 ? "s" : ""}</span>
                      </div>
                      {profile?.githubUrl && (
                        <a href={String(profile.githubUrl)} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                        >
                          <GitBranch size={12} /> GitHub
                        </a>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Full ranking table */}
            <div className="border border-zinc-200">
              <div className="grid grid-cols-12 bg-zinc-50 border-b border-zinc-200 px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Builder</div>
                <div className="col-span-2 text-center">Total Score</div>
                <div className="col-span-2 text-center">Best Score</div>
                <div className="col-span-2 text-center">Problems</div>
                <div className="col-span-1 text-right">Profile</div>
              </div>
              {ranked.map((builder, i) => {
                const profile = profiles[builder.userId];
                return (
                  <div key={builder.userId} className={`grid grid-cols-12 items-center px-6 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${i < 3 ? "font-semibold" : ""}`}>
                    <div className="col-span-1">
                      <span className={`text-sm ${i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-zinc-500"} font-bold`}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-sm rounded-full shrink-0">
                        {builder.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/profile/${builder.userId}`} className="text-sm font-medium text-zinc-900 hover:text-[#1a3a5c] transition-colors truncate block">
                          {builder.studentName}
                        </Link>
                        {profile?.country && (
                          <div className="text-xs text-zinc-400">{String(profile.country)}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-bold text-zinc-900">{builder.totalScore}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-zinc-600">{builder.bestScore}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-zinc-600">{builder.uniqueProblems}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <Link href={`/profile/${builder.userId}`}
                        className="text-zinc-400 hover:text-[#1a3a5c] transition-colors inline-block p-1">
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
