import { getPlatformStats, getProblems } from "@/lib/data";
import { Users, Briefcase, Trophy, Link as LinkIcon, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getPlatformStats();
  
  // We need to fetch all problems to find the ones pending moderation (source: COMMUNITY, verified: false)
  const problemsRes = await getProblems();
  const allProblems = problemsRes.items;
  const pendingModeration = allProblems.filter(p => p.source === "COMMUNITY" && !p.verified);

  const cards = [
    { title: "Total Users", value: stats.totalStudents, icon: Users, color: "text-blue-400", bg: "bg-white/5 border border-white/10" },
    { title: "Total Organizations", value: stats.totalOrgs, icon: Briefcase, color: "text-blue-400", bg: "bg-white/5 border border-white/10" },
    { title: "Active Challenges", value: stats.activeProblems, icon: LinkIcon, color: "text-blue-400", bg: "bg-white/5 border border-white/10" },
    { title: "Total Prize Pool", value: `$${stats.totalPrizePool.toLocaleString()}`, icon: Trophy, color: "text-blue-400", bg: "bg-white/5 border border-white/10" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-zinc-400 mt-1">High-level metrics across the OpenSolve platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-transparent border border-white/10 rounded-xl p-6 shadow-sm">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${c.bg}`}>
                <Icon className={c.color} size={24} />
              </div>
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{c.title}</p>
              <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-transparent border border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 bg-transparent/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-white">Moderation Action Required</h2>
          </div>
          {pendingModeration.length > 0 && (
            <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-full">
              {pendingModeration.length} Pending
            </span>
          )}
        </div>
        
        <div className="p-6">
          {pendingModeration.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-zinc-400 font-medium">Inbox zero!</p>
              <p className="text-sm text-zinc-400 mt-1">No community submissions pending moderation.</p>
            </div>
          ) : (
            <div>
              <p className="text-zinc-400 mb-6">
                There are <strong className="text-white">{pendingModeration.length}</strong> crowdsourced challenges waiting for administrator approval before they receive the official platform verification badge.
              </p>
              <Link href="/admin/moderation" className="btn-primary py-2.5 px-6 inline-flex items-center gap-2">
                Review Queue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
