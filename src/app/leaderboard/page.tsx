import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { Trophy, GitBranch, Globe, ExternalLink, Medal, Search } from "lucide-react";

export const revalidate = 300; // Cache for 5 minutes

export const metadata = {
  title: "Leaderboard | OpenSolve",
  description: "See the top builders and scouts on OpenSolve — ranked by cumulative solution score and challenge discovery contributions.",
};

const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const activeTab = sp.tab === "scouts" ? "scouts" : "builders";

  // ========== BUILDERS TAB ==========
  let allSubmissions: Record<string, unknown>[] = [];
  try {
    // Instead of scanning the entire table, we Query the GSI. 
    // Note: A true production leaderboard uses a materialized view / CRON job to aggregate scores daily into a Profiles table.
    // For this tier, Querying the GSI is significantly cheaper and faster than a full table scan.
    let lastKey = undefined;
    do {
      const res = await docClient.send(new QueryCommand({
        TableName: SUBMISSIONS_TABLE,
        IndexName: "entityType-score-index",
        KeyConditionExpression: "entityType = :type",
        ExpressionAttributeValues: { ":type": "SUBMISSION" },
        ExclusiveStartKey: lastKey
      }));
      if (res.Items) allSubmissions.push(...res.Items);
      lastKey = res.LastEvaluatedKey;
    } while (lastKey);
  } catch (err: unknown) {
    console.error("[CRITICAL] Leaderboard submissions scan error:", err instanceof Error ? err.message : err);
  }

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
      aggregated[uid] = { userId: uid, totalScore: 0, submissionCount: 0, bestScore: 0, uniqueProblems: 0, problemIds: new Set(), studentName: name };
    }
    aggregated[uid].totalScore += score;
    aggregated[uid].submissionCount += 1;
    aggregated[uid].bestScore = Math.max(aggregated[uid].bestScore, score);
    aggregated[uid].problemIds.add(sub.problemId as string);
    aggregated[uid].uniqueProblems = aggregated[uid].problemIds.size;
    aggregated[uid].studentName = name;
  }

  const ranked = Object.values(aggregated)
    .map(r => ({ ...r, problemIds: Array.from(r.problemIds) }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100);

  // ========== SCOUTS TAB ==========
  let scoutedProblems: Record<string, unknown>[] = [];
  try {
    let lastKey = undefined;
    do {
      const res = await docClient.send(new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "entityType-deadline-index",
        KeyConditionExpression: "entityType = :type",
        FilterExpression: "#src = :community AND attribute_exists(scoutId)",
        ExpressionAttributeNames: { "#src": "source" },
        ExpressionAttributeValues: { ":type": "PROBLEM", ":community": "COMMUNITY" },
        ExclusiveStartKey: lastKey
      }));
      if (res.Items) scoutedProblems.push(...res.Items);
      lastKey = res.LastEvaluatedKey;
    } while (lastKey);
  } catch (err: unknown) {
    console.error("[CRITICAL] Leaderboard problem fetch error (builders tab):", err instanceof Error ? err.message : err);
  }

  // Aggregate by scoutId
  const scoutAgg: Record<string, {
    scoutId: string;
    scoutName: string;
    scoutPoints: number;
    challengesSubmitted: number;
    challengesApproved: number;
  }> = {};

  for (const p of scoutedProblems) {
    const sid = p.scoutId as string;
    if (!sid) continue;
    if (!scoutAgg[sid]) {
      scoutAgg[sid] = {
        scoutId: sid,
        scoutName: p.scoutName as string || "Anonymous Scout",
        scoutPoints: 0,
        challengesSubmitted: 0,
        challengesApproved: 0,
      };
    }
    scoutAgg[sid].challengesSubmitted += 1;
    if (p.status === "OPEN") scoutAgg[sid].challengesApproved += 1;
  }

  // Fetch scout points from profiles in a single batch request
  const scoutIds = Object.keys(scoutAgg).slice(0, 30);
  if (scoutIds.length > 0) {
    try {
      const res = await docClient.send(new BatchGetCommand({
        RequestItems: {
          [PROFILES_TABLE]: {
            Keys: scoutIds.map(id => ({ userId: id }))
          }
        }
      }));
      const fetchedProfiles = res.Responses?.[PROFILES_TABLE] || [];
      for (const p of fetchedProfiles) {
        const sid = p.userId as string;
        if (scoutAgg[sid]) {
          scoutAgg[sid].scoutPoints = Number(p.scoutPoints) || 0;
          if (p.name) scoutAgg[sid].scoutName = String(p.name);
        }
      }
    } catch (err: unknown) {
      console.error("[CRITICAL] Leaderboard problems scan error (scouts tab):", err instanceof Error ? err.message : err);
    }
  }

  const rankedScouts = Object.values(scoutAgg)
    .sort((a, b) => b.scoutPoints - a.scoutPoints || b.challengesApproved - a.challengesApproved)
    .slice(0, 100);

  // Fetch profiles for builder top 20 in a single batch request
  const profileIds = ranked.slice(0, 20).map(r => r.userId);
  const profiles: Record<string, Record<string, unknown>> = {};
  if (profileIds.length > 0) {
    try {
      const res = await docClient.send(new BatchGetCommand({
        RequestItems: {
          [PROFILES_TABLE]: {
            Keys: profileIds.map(id => ({ userId: id }))
          }
        }
      }));
      const fetchedProfiles = res.Responses?.[PROFILES_TABLE] || [];
      for (const p of fetchedProfiles) {
        profiles[p.userId as string] = p;
      }
    } catch (err) {
      console.error("BatchGetCommand error for builders:", err);
    }
  }

  const medalColors = ["text-yellow-500", "text-zinc-400", "text-amber-700"];

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-6">
      <div className="w-full max-w-[125rem] mx-auto">

        {/* Header */}
        <div className="mb-10 border-b border-zinc-200 pb-10">
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-bold text-zinc-600 uppercase tracking-wider mb-6">
            <Trophy size={14} /> Global Rankings
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-3">
            Leaderboard
          </h1>
          <p className="text-zinc-500 text-base max-w-xl">
            The best builders and community scouts on OpenSolve, ranked by performance.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 border border-zinc-200 bg-zinc-50 p-1 rounded-lg w-fit mb-10">
          <Link
            href="/leaderboard"
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "builders"
                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Trophy size={14} /> Top Builders
          </Link>
          <Link
            href="/leaderboard?tab=scouts"
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === "scouts"
                ? "bg-purple-700 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            🕵️ Top Scouts
          </Link>
        </div>

        {/* ===== BUILDERS TAB ===== */}
        {activeTab === "builders" && (
          <>
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
                          <div className="font-semibold text-zinc-900 text-lg group-hover:text-[#1a3a5c] transition-colors">{builder.studentName}</div>
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
                            {profile?.country && <div className="text-xs text-zinc-400">{String(profile.country)}</div>}
                          </div>
                        </div>
                        <div className="col-span-2 text-center"><span className="text-sm font-bold text-zinc-900">{builder.totalScore}</span></div>
                        <div className="col-span-2 text-center"><span className="text-sm text-zinc-600">{builder.bestScore}</span></div>
                        <div className="col-span-2 text-center"><span className="text-sm text-zinc-600">{builder.uniqueProblems}</span></div>
                        <div className="col-span-1 text-right">
                          <Link href={`/profile/${builder.userId}`} className="text-zinc-400 hover:text-[#1a3a5c] transition-colors inline-block p-1">
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ===== SCOUTS TAB ===== */}
        {activeTab === "scouts" && (
          <>
            <div className="bg-purple-50 border border-purple-100 p-5 mb-8 flex items-start gap-3">
              <span className="text-2xl mt-0.5 shrink-0">🕵️</span>
              <div>
                <div className="font-semibold text-purple-900 mb-1">How Scout Points Work</div>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Scouts discover real challenges from the internet and share them with the OpenSolve community. Every approved challenge earns <strong>100 Scout Points</strong>. If someone wins prize money from your scouted challenge, you earn a <strong>5% finder's fee</strong>. Rank up and display the <strong>Elite Scout 🏆</strong> badge on your profile.
                </p>
              </div>
            </div>

            {rankedScouts.length === 0 ? (
              <div className="border border-dashed border-purple-200 p-20 text-center">
                <div className="text-5xl mb-4">🕵️</div>
                <p className="text-zinc-500 font-medium">No scouts yet.</p>
                <p className="text-zinc-400 text-sm mt-1">Be the first to discover and share a real bounty.</p>
                <Link href="/submit-challenge" className="inline-block mt-6 px-6 py-2.5 text-sm font-medium bg-purple-700 text-white hover:bg-purple-800 transition-colors">
                  Scout a Challenge
                </Link>
              </div>
            ) : (
              <div className="border border-zinc-200">
                <div className="grid grid-cols-12 bg-purple-50 border-b border-purple-200 px-6 py-3 text-xs font-bold text-purple-600 uppercase tracking-wider">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Scout</div>
                  <div className="col-span-3 text-center">Scout Points</div>
                  <div className="col-span-2 text-center">Challenges</div>
                  <div className="col-span-2 text-center">Approved</div>
                </div>
                {rankedScouts.map((scout, i) => (
                  <div key={scout.scoutId} className={`grid grid-cols-12 items-center px-6 py-4 border-b border-zinc-100 hover:bg-purple-50 transition-colors ${i < 3 ? "font-semibold" : ""}`}>
                    <div className="col-span-1">
                      <span className={`text-sm font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-zinc-500"}`}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-9 h-9 bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-sm rounded-full shrink-0">
                        {scout.scoutName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/profile/${scout.scoutId}`} className="text-sm font-medium text-zinc-900 hover:text-purple-700 transition-colors block">
                          {scout.scoutName}
                        </Link>
                        {i === 0 && <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Elite Scout 🏆</span>}
                      </div>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-sm font-bold text-purple-700">{scout.scoutPoints.toLocaleString()} pts</span>
                    </div>
                    <div className="col-span-2 text-center"><span className="text-sm text-zinc-600">{scout.challengesSubmitted}</span></div>
                    <div className="col-span-2 text-center">
                      <span className={`text-sm font-semibold ${scout.challengesApproved > 0 ? "text-green-600" : "text-zinc-400"}`}>
                        {scout.challengesApproved}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/submit-challenge" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white font-medium text-sm hover:bg-purple-800 transition-colors">
                <Search size={16} /> Scout a Challenge &amp; Earn Points
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
