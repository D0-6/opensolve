import { docClient } from "@/lib/dynamodb";
import { QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";
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
    const res = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: "entityType-score-index",
      KeyConditionExpression: "entityType = :type",
      ExpressionAttributeValues: { ":type": "SUBMISSION" },
      Limit: 100,
      ScanIndexForward: false
    }));
    if (res.Items) allSubmissions.push(...res.Items);
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
    const res = await docClient.send(new QueryCommand({
      TableName: PROBLEMS_TABLE,
      IndexName: "entityType-deadline-index",
      KeyConditionExpression: "entityType = :type",
      FilterExpression: "#src = :community AND attribute_exists(scoutId)",
      ExpressionAttributeNames: { "#src": "source" },
      ExpressionAttributeValues: { ":type": "PROBLEM", ":community": "COMMUNITY" },
      Limit: 100,
      ScanIndexForward: false
    }));
    if (res.Items) scoutedProblems.push(...res.Items);
  } catch (err: unknown) {
    console.error("[CRITICAL] Leaderboard problem fetch error (builders tab):", err instanceof Error ? err.message : err);
  }

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

  const medalColors = ["text-yellow-400", "text-zinc-300", "text-amber-600"];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] mask-radial-faded pointer-events-none" />
      <div className="w-full max-w-[125rem] mx-auto relative z-10">

        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-10">
          <div className="inline-flex items-center gap-2 glass-card border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Trophy size={14} className="text-yellow-500" /> Global Rankings
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-white mb-3">
            Leaderboard
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl font-body">
            The elite builders and community scouts on OpenSolve, ranked by verifiable performance.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 glass-card p-1.5 rounded-full w-fit mb-10 border-white/10">
          <Link
            href="/leaderboard"
            className={`px-6 py-2.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 ${
              activeTab === "builders"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy size={14} /> Top Builders
          </Link>
          <Link
            href="/leaderboard?tab=scouts"
            className={`px-6 py-2.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 ${
              activeTab === "scouts"
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search size={14} /> Top Scouts
          </Link>
        </div>

        {/* ===== BUILDERS TAB ===== */}
        {activeTab === "builders" && (
          <>
            {ranked.length === 0 ? (
              <div className="glass-card border-dashed border-white/20 p-20 text-center rounded-2xl">
                <Trophy size={40} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-300 font-medium">No submissions yet.</p>
                <p className="text-zinc-500 text-sm mt-1">Be the first to solve a challenge and claim your spot.</p>
                <Link href="/challenges" className="btn-primary bg-white text-black mt-6 px-6 py-2.5 text-sm">Browse Challenges</Link>
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
                          className={`glass-card p-8 flex flex-col items-center text-center transition-all group rounded-2xl relative overflow-hidden ${
                            i === 0 ? "border-yellow-500/30 bg-yellow-500/5 order-first md:order-2 shadow-[0_0_30px_rgba(234,179,8,0.1)]" :
                            i === 1 ? "border-zinc-300/30 bg-zinc-400/5 order-2 md:order-1" :
                            "border-amber-600/30 bg-amber-600/5 order-3"
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-10 transition-opacity ${
                            i === 0 ? "from-yellow-500" : i === 1 ? "from-white" : "from-amber-600"
                          } to-transparent`} />
                          
                          <Medal size={32} className={`mb-6 relative z-10 ${medalColors[i]} drop-shadow-lg`} />
                          <div className="w-20 h-20 bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center text-white text-3xl font-display font-bold mb-5 rounded-full relative z-10 shadow-inner">
                            {builder.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-display font-semibold text-white text-xl relative z-10">{builder.studentName}</div>
                          {profile?.country && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mt-2 bg-white/5 px-3 py-1 rounded-full relative z-10">
                              <Globe size={11} className="text-zinc-500" /> {String(profile.country)}
                            </div>
                          )}
                          <div className="mt-6 text-4xl font-display font-bold text-white relative z-10 tracking-tight">{builder.totalScore}</div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-2 relative z-10">Total Score</div>
                          <div className="mt-4 flex gap-4 text-xs font-medium text-zinc-400 relative z-10 bg-[#0a0a0a]/50 px-4 py-2 rounded-lg border border-white/5">
                            <span>{builder.submissionCount} submission{builder.submissionCount !== 1 ? "s" : ""}</span>
                            <span className="w-[1px] bg-white/10"></span>
                            <span>{builder.uniqueProblems} problem{builder.uniqueProblems !== 1 ? "s" : ""}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Full ranking table */}
                <div className="glass-card rounded-2xl overflow-hidden border-white/10">
                  <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Builder</div>
                    <div className="col-span-2 text-center">Total Score</div>
                    <div className="col-span-2 text-center">Best Score</div>
                    <div className="col-span-2 text-center">Problems</div>
                    <div className="col-span-1 text-right">Profile</div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {ranked.map((builder, i) => {
                      const profile = profiles[builder.userId];
                      return (
                        <div key={builder.userId} className={`grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.02] transition-colors ${i < 3 ? "bg-white/[0.01]" : ""}`}>
                          <div className="col-span-1">
                            <span className={`text-sm font-display font-bold ${i === 0 ? "text-yellow-500 drop-shadow-md" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600"}`}>
                              {i + 1}
                            </span>
                          </div>
                          <div className="col-span-4 flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 font-display font-bold text-sm rounded-full shrink-0">
                              {builder.studentName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/profile/${builder.userId}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block">
                                {builder.studentName}
                              </Link>
                              {profile?.country && <div className="text-xs text-zinc-500 mt-0.5">{String(profile.country)}</div>}
                            </div>
                          </div>
                          <div className="col-span-2 text-center"><span className="text-base font-display font-semibold text-white tracking-tight">{builder.totalScore}</span></div>
                          <div className="col-span-2 text-center"><span className="text-sm text-zinc-400 font-medium">{builder.bestScore}</span></div>
                          <div className="col-span-2 text-center"><span className="text-sm text-zinc-400 font-medium">{builder.uniqueProblems}</span></div>
                          <div className="col-span-1 text-right flex justify-end">
                            <Link href={`/profile/${builder.userId}`} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                              <ExternalLink size={14} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ===== SCOUTS TAB ===== */}
        {activeTab === "scouts" && (
          <>
            <div className="glass-card bg-blue-900/10 border-blue-500/20 p-6 mb-10 flex items-start gap-4 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Search size={20} className="text-blue-400" />
              </div>
              <div className="relative z-10 pt-1">
                <div className="font-semibold text-blue-100 mb-2 text-lg">How Scout Points Work</div>
                <p className="text-sm text-blue-200/70 leading-relaxed max-w-4xl">
                  Scouts discover real challenges from the internet and share them with the OpenSolve community. Every approved challenge earns <strong className="text-blue-300">100 Scout Points</strong>. If someone wins prize money from your scouted challenge, you earn a <strong className="text-blue-300">5% finder&apos;s fee</strong>. Rank up and display the <strong className="text-blue-300">Elite Scout 🏆</strong> badge on your profile.
                </p>
              </div>
            </div>

            {rankedScouts.length === 0 ? (
              <div className="glass-card border-dashed border-white/20 p-20 text-center rounded-2xl">
                <Search size={40} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-300 font-medium">No scouts yet.</p>
                <p className="text-zinc-500 text-sm mt-1">Be the first to discover and share a real bounty.</p>
                <Link href="/submit-challenge" className="inline-flex items-center justify-center mt-6 px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                  Scout a Challenge
                </Link>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden border-white/10">
                <div className="grid grid-cols-12 bg-white/5 border-b border-white/10 px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  <div className="col-span-1">#</div>
                  <div className="col-span-4">Scout</div>
                  <div className="col-span-3 text-center">Scout Points</div>
                  <div className="col-span-2 text-center">Challenges</div>
                  <div className="col-span-2 text-center">Approved</div>
                </div>
                <div className="divide-y divide-white/5">
                  {rankedScouts.map((scout, i) => (
                    <div key={scout.scoutId} className={`grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.02] transition-colors ${i < 3 ? "bg-blue-900/5" : ""}`}>
                      <div className="col-span-1">
                        <span className={`text-sm font-display font-bold ${i === 0 ? "text-yellow-500 drop-shadow-md" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-600"}`}>
                          {i + 1}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 font-display font-bold text-sm rounded-full shrink-0">
                          {scout.scoutName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/profile/${scout.scoutId}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors block">
                            {scout.scoutName}
                          </Link>
                          {i === 0 && <span className="inline-block mt-1 bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] font-bold text-blue-400 uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.2)]">Elite Scout 🏆</span>}
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className="text-base font-display font-semibold text-white tracking-tight">{scout.scoutPoints.toLocaleString()} <span className="text-zinc-500 text-xs font-medium ml-1">PTS</span></span>
                      </div>
                      <div className="col-span-2 text-center"><span className="text-sm text-zinc-400 font-medium">{scout.challengesSubmitted}</span></div>
                      <div className="col-span-2 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border ${scout.challengesApproved > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "border-white/5 bg-white/5 text-zinc-500"}`}>
                          {scout.challengesApproved}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link href="/submit-challenge" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium text-sm rounded-full hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                <Search size={16} /> Scout a Challenge &amp; Earn Points
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
