import { getProblems, getPlatformStats, type Problem } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { Lock, ArrowRight, Zap, Target, Users, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string }> = {
  YC_STARTUP: { label: "YC Startup" },
  GOVERNMENT: { label: "Government" },
  INDUSTRY: { label: "Industry" },
};

function ProblemRow({ problem }: { problem: Problem }) {
  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;
  const hoursLeft = differenceInHours(new Date(problem.deadline), new Date());
  const isPast = hoursLeft <= 0;
  const isRestricted = Array.isArray(problem.allowedCountries) && problem.allowedCountries.length > 0;

  const timeText = isPast ? "Closed" : `Closes in ${formatDistanceToNow(new Date(problem.deadline))}`;

  return (
    <Link
      href={`/problems/${problem.problemId}`}
      className="glass-card block p-5 rounded-xl hover:bg-white/5 transition-all group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-500" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-label-mono text-[10px] leading-tight uppercase tracking-wider font-semibold">
              {cfg.label}
            </span>
            <span className="text-zinc-400 font-label-mono text-[10px] uppercase tracking-wider">
              {problem.domain}
            </span>
            {isRestricted && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase tracking-wider font-semibold">
                <Lock size={10} /> Restricted
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
            {problem.title}
          </h3>
          {problem.description && (
            <p className="font-body text-sm text-zinc-400 mt-2 line-clamp-1">
              {problem.description}
            </p>
          )}
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0">
          <div className="text-right">
            {problem.prizeAmount > 0 ? (
              <span className="block font-display text-xl text-white font-semibold tracking-tight">
                ${problem.prizeAmount.toLocaleString()}
              </span>
            ) : (
              <span className="block font-label-mono text-[11px] uppercase tracking-wider text-zinc-300 font-bold">
                {problem.prizeType ? problem.prizeType.replace(/_/g, " ") : "BOUNTY"}
              </span>
            )}
            <span className="block font-label-mono text-[11px] text-zinc-500 uppercase tracking-wider mt-1.5 flex items-center gap-1.5 justify-end">
              <span className={`w-1.5 h-1.5 rounded-full ${isPast ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
              {timeText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ source?: string; domain?: string }> }) {
  const sp = await searchParams;
  const [problemsRes, stats] = await Promise.all([
    getProblems(sp.source, sp.domain),
    getPlatformStats(),
  ]);
  const problems = problemsRes.items;
  
  const newThisWeek = problems.filter((p: Problem) => {
    if (!p.postedAt) return false;
    return differenceInHours(new Date(), new Date(p.postedAt)) < 168;
  }).length;

  const sources = [
    { label: "All", value: undefined },
    { label: "YC Startups", value: "YC_STARTUP" },
    { label: "Government", value: "GOVERNMENT" },
    { label: "Industry", value: "INDUSTRY" },
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-100 selection:bg-blue-500/30 selection:text-blue-200">
      <style dangerouslySetInnerHTML={{__html: `html { scroll-behavior: smooth; }`}} />
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.03] mask-radial-faded" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      
      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32 px-6">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center gap-8 fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-white/10 text-xs font-medium text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            Open Innovation Platform
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter text-white leading-[1.1]">
            Where Builders Meet <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              Real Opportunities.
            </span>
          </h1>
          
          <p className="font-body text-lg md:text-xl text-zinc-400 max-w-2xl mt-2 leading-relaxed">
            Solve funded challenges from YC startups, government innovation programs, and top companies. Build your portfolio. Get hired. Win prizes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link href="/challenges" className="w-full sm:w-auto btn-primary bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-full font-medium text-[15px] flex items-center justify-center gap-2">
              Browse Problems <ArrowRight size={16} />
            </Link>
            <Link href="/organizations/new" className="w-full sm:w-auto btn-secondary glass-card border-white/10 hover:bg-white/5 px-8 py-6 rounded-full font-medium text-[15px] text-white flex items-center justify-center">
              Post a Challenge
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative z-10 pb-24 px-6 fade-in-up delay-100">
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Challenges", value: problems.length, icon: Target },
              { label: "Builders Registered", value: stats.totalStudents > 0 ? stats.totalStudents.toLocaleString() : "0", icon: Users },
              { label: "Total Prizes", value: stats.totalPrizePool > 0 ? `$${(stats.totalPrizePool / 1000).toFixed(0)}k+` : "Varied", icon: Zap },
              { label: "Solutions Submitted", value: stats.totalSubmissions > 0 ? stats.totalSubmissions.toLocaleString() : "0", icon: Shield }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-white/5">
                <stat.icon size={20} className="text-blue-400 mb-2" />
                <div className="text-3xl font-semibold text-white tracking-tight">{stat.value}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Challenges Section */}
      <section id="challenges" className="relative z-10 py-24 px-6 w-full max-w-5xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 fade-in-up">
          <div>
            <h2 className="text-3xl font-semibold text-white tracking-tight">Directory</h2>
            <p className="text-zinc-400 mt-2">Discover and solve live technical challenges.</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mt-6 md:mt-0 overflow-x-auto pb-1 glass-card p-1.5 rounded-full border-white/10">
            {sources.map(({ label, value }) => {
              const isActive = sp.source === value || (!sp.source && !value);
              const href = value ? `/?source=${value}` : "/";
              return (
                <Link
                  key={label}
                  href={href}
                  scroll={false}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dense List Layout */}
        {problems.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-2xl border-white/5">
            <p className="text-zinc-400 font-medium">No challenges found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {problems.map((problem: Problem) => (
              <ProblemRow key={problem.problemId} problem={problem} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Bento Box */}
      <section className="relative z-10 py-24 px-6 border-t border-white/10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="mb-12 text-center fade-in-up">
            <h2 className="text-3xl font-semibold text-white tracking-tight">How OpenSolve Works</h2>
            <p className="text-zinc-400 mt-3 text-lg">A transparent pipeline from challenge to career.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* For Builders */}
            <div className="glass-card p-8 rounded-3xl border-white/10 fade-in-up delay-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen" />
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-blue-400 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> For Builders
              </h3>
              <div className="space-y-8 relative z-10">
                {[
                  { num: "01", title: "Browse Challenges", desc: "Filter by domain, prize type, or source. Find problems that match your skills." },
                  { num: "02", title: "Submit Your Solution", desc: "Share your GitHub repo and writeup. Your solution is public and verifiable." },
                  { num: "03", title: "Get Hired or Win", desc: "Top submissions get contacted directly by companies for jobs or contracts." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="group flex gap-4">
                    <span className="text-zinc-600 font-display font-medium text-lg">{num}</span>
                    <div>
                      <h4 className="text-base font-semibold text-zinc-100">{title}</h4>
                      <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Orgs */}
            <div className="glass-card p-8 rounded-3xl border-white/10 fade-in-up delay-200 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/10 blur-[80px] rounded-full mix-blend-screen" />
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-500" /> For Organizations
              </h3>
              <div className="space-y-8 relative z-10">
                {[
                  { num: "01", title: "Post a Challenge", desc: "Describe your problem, set a prize, and publish. We surface it to thousands of builders." },
                  { num: "02", title: "Review Submissions", desc: "All solutions are ranked. View GitHub repos, demos, and writeups at a glance." },
                  { num: "03", title: "Contact Top Talent", desc: "Reach out to your top performers directly. Hire, contract, or pilot their solution." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="group flex gap-4">
                    <span className="text-zinc-600 font-display font-medium text-lg">{num}</span>
                    <div>
                      <h4 className="text-base font-semibold text-zinc-100">{title}</h4>
                      <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 text-center text-sm text-zinc-500">
        <p>© 2026 OpenSolve. Built on Vercel & AWS DynamoDB.</p>
      </footer>
    </div>
  );
}
