import { getProblems, getPlatformStats, type Problem } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { Lock } from "lucide-react";

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
      className="block border-b border-zinc-200 py-6 px-4 hover:bg-zinc-50 transition-colors group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full border border-zinc-300 text-zinc-600 font-label-mono text-[11px] leading-tight shrink-0 uppercase tracking-wide font-semibold">
              {cfg.label}
            </span>
            <span className="text-zinc-500 font-label-mono text-[11px] uppercase tracking-wide">
              {problem.domain}
            </span>
            {isRestricted && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 text-[10px] uppercase tracking-wide font-bold bg-amber-50">
                <Lock size={9} /> Country Restricted
              </span>
            )}
          </div>
          <h3 className="font-body-lg text-lg font-semibold text-zinc-900 group-hover:text-[#1a3a5c] transition-colors truncate">
            {problem.title}
          </h3>
          {problem.description && (
            <p className="font-body-md text-zinc-500 mt-1 line-clamp-1">
              {problem.description}
            </p>
          )}
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0">
          <div className="text-right">
            {problem.prizeAmount > 0 ? (
              <span className="block font-body-md text-zinc-900 font-bold">${problem.prizeAmount.toLocaleString()}</span>
            ) : (
              <span className="block font-label-mono text-[11px] uppercase tracking-wide text-zinc-600 font-bold">
                {problem.prizeType ? problem.prizeType.replace(/_/g, " ") : "BOUNTY"}
              </span>
            )}
            <span className="block font-label-mono text-[11px] text-zinc-400 uppercase tracking-wide mt-1">
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
  
  const totalPrize = problems.reduce((sum: number, p: Problem) => sum + (Number(p.prizeAmount) || 0), 0);
  
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
    <div className="bg-white min-h-screen text-zinc-900 selection:bg-zinc-200">
      <style dangerouslySetInnerHTML={{__html: `html { scroll-behavior: smooth; }`}} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="w-full max-w-[125rem] mx-auto flex flex-col items-start gap-6 fade-in-up">
          <h1 className="font-display-xl text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 leading-[1.1]">
            Where Builders Meet <br className="hidden md:block" />
            <span className="text-zinc-400">Real Opportunities.</span>
          </h1>
          
          <p className="font-body-lg text-lg text-zinc-500 max-w-2xl mt-2 leading-relaxed">
            Solve funded challenges from YC startups, government innovation programs, and top companies. Build your portfolio. Get hired. Win prizes.
          </p>
          
          <div className="flex items-center gap-4 mt-6">
            <Link href="/challenges" className="btn-primary px-6 py-3 font-medium text-[15px]">
              Browse Problems
            </Link>
            <Link href="/organizations/new" className="btn-secondary px-6 py-3 font-medium text-[15px]">
              Post a Challenge
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-zinc-200 bg-zinc-50 fade-in-up delay-100">
        <div className="w-full max-w-[125rem] mx-auto px-6 flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-zinc-200 py-6 md:py-0">
          <div className="py-4 md:py-8 w-full md:flex-1 text-center md:text-left md:pr-8">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-3xl font-medium text-zinc-900">{problems.length}</span>
              {newThisWeek > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] uppercase font-bold tracking-wider">
                  {newThisWeek} New This Week
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Active Challenges</p>
          </div>
          
          <div className="py-4 md:py-8 w-full md:flex-1 text-center md:pl-8 md:pr-8">
            <div className="text-3xl font-medium text-zinc-900">
              {stats.totalStudents > 0 ? stats.totalStudents.toLocaleString() : "0"}
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Builders Registered</p>
          </div>
          
          <div className="py-4 md:py-8 w-full md:flex-1 text-center md:pl-8 md:pr-8">
            <div className="text-3xl font-medium text-zinc-900">
              {stats.totalPrizePool > 0 ? `$${(stats.totalPrizePool / 1000).toFixed(0)}k+` : "Varied"}
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">In Prizes</p>
          </div>

          <div className="py-4 md:py-8 w-full md:flex-1 text-center md:text-right md:pl-8">
            <div className="text-3xl font-medium text-zinc-900">
              {stats.totalSubmissions > 0 ? stats.totalSubmissions.toLocaleString() : "0"}
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Solutions Submitted</p>
          </div>
        </div>
      </section>

      {/* Active Challenges Section */}
      <section id="challenges" className="py-24 px-6 w-full max-w-[125rem] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-zinc-200 pb-4 fade-in-up">
          <div>
            <h2 className="text-2xl font-medium text-zinc-900">Directory</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-6 mt-6 md:mt-0 overflow-x-auto pb-1">
            {sources.map(({ label, value }) => {
              const isActive = sp.source === value || (!sp.source && !value);
              const href = value ? `/?source=${value}` : "/";
              return (
                <Link
                  key={label}
                  href={href}
                  scroll={false}
                  className={`pb-1 text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "text-zinc-900 border-b-2 border-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 border-b-2 border-transparent"
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
          <div className="py-16 text-center">
            <p className="text-zinc-500">No challenges found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col border-t border-zinc-200">
            {problems.map((problem: Problem) => (
              <ProblemRow key={problem.problemId} problem={problem} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-zinc-50 border-t border-zinc-200">
        <div className="w-full max-w-[125rem] mx-auto">
          <div className="mb-16 fade-in-up">
            <h2 className="text-2xl font-medium text-zinc-900">How OpenSolve Works</h2>
            <p className="text-zinc-500 mt-2">A transparent pipeline from challenge to career.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Builders */}
            <div className="fade-in-up delay-100">
              <h3 className="text-sm font-bold tracking-widest uppercase text-zinc-400 mb-8 pb-4 border-b border-zinc-200">
                For Builders
              </h3>
              <div className="space-y-6">
                {[
                  { num: "01.", title: "Browse Challenges", desc: "Filter by domain, prize type, or source. Find problems that match your skills." },
                  { num: "02.", title: "Submit Your Solution", desc: "Share your GitHub repo and writeup. Your solution is public and verifiable." },
                  { num: "03.", title: "Get Hired or Win", desc: "Top submissions get contacted directly by companies for jobs or contracts." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="group">
                    <h4 className="text-base font-medium text-zinc-900 flex gap-2">
                      <span className="text-zinc-400">{num}</span> {title}
                    </h4>
                    <p className="text-sm text-zinc-500 mt-1 ml-7">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Orgs */}
            <div className="fade-in-up delay-200">
              <h3 className="text-sm font-bold tracking-widest uppercase text-zinc-400 mb-8 pb-4 border-b border-zinc-200">
                For Organizations
              </h3>
              <div className="space-y-6">
                {[
                  { num: "01.", title: "Post a Challenge", desc: "Describe your problem, set a prize, and publish. We surface it to thousands of builders." },
                  { num: "02.", title: "Review Submissions", desc: "All solutions are ranked. View GitHub repos, demos, and writeups at a glance." },
                  { num: "03.", title: "Contact Top Talent", desc: "Reach out to your top performers directly. Hire, contract, or pilot their solution." },
                ].map(({ num, title, desc }) => (
                  <div key={num} className="group">
                    <h4 className="text-base font-medium text-zinc-900 flex gap-2">
                      <span className="text-zinc-400">{num}</span> {title}
                    </h4>
                    <p className="text-sm text-zinc-500 mt-1 ml-7">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
