import { getProblems } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { BadgeCheck, Clock, Building, Trophy, Code } from "lucide-react";
import { cn } from "@/lib/utils";

// Make the page dynamic so it fetches fresh data
export const dynamic = "force-dynamic";

function SourceBadge({ source, verified }: { source: string; verified?: boolean }) {
  const colors: Record<string, string> = {
    "YC_STARTUP": "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "GOVERNMENT": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "INDUSTRY": "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };
  
  return (
    <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1", colors[source] || colors["INDUSTRY"])}>
      {source.replace("_", " ")}
      {verified && <BadgeCheck className="w-3.5 h-3.5" />}
    </div>
  );
}

function Deadline({ date }: { date: string }) {
  const targetDate = new Date(date);
  const hoursLeft = differenceInHours(targetDate, new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft < 48;
  const isPast = hoursLeft <= 0;

  return (
    <div className={cn("flex items-center gap-1 text-sm font-medium", isUrgent ? "text-red-500" : isPast ? "text-slate-400" : "text-emerald-600")}>
      <Clock className="w-4 h-4" />
      {isPast ? "Closed" : formatDistanceToNow(targetDate, { addSuffix: true })}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: { source?: string; domain?: string };
}) {
  const problems = await getProblems(searchParams.source, searchParams.domain);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Solve Real Problems.<br/><span className="text-blue-600">Get Real Rewards.</span></h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Submit verifiable solutions to challenges from YC startups, government innovation cells, and top industry players.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
          <Link href="/organizations/new" className="group glass-panel p-8 rounded-3xl flex flex-col items-center text-center hover:border-blue-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">I'm hiring</h2>
            <p className="text-slate-500 mb-6">Post a problem and fund solutions from top developers.</p>
            <span className="font-semibold text-blue-600 dark:text-blue-400">Post a Problem &rarr;</span>
          </Link>

          <a href="#problems" className="group glass-panel p-8 rounded-3xl flex flex-col items-center text-center hover:border-emerald-500/30 transition-all hover:-translate-y-1">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Code className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">I want to solve</h2>
            <p className="text-slate-500 mb-6">Browse real funded challenges and submit your solutions.</p>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">View Problems &rarr;</span>
          </a>
        </div>
      </div>

      <div id="problems" className="pt-8 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-8">Active Problems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 glass-panel rounded-2xl">
            No problems found. Check back later or run the seed script!
          </div>
        ) : (
          problems.map((problem) => (
            <Link href={`/problems/${problem.problemId}`} key={problem.problemId} className="group block h-full">
              <div className="glass-panel p-6 rounded-2xl h-full flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-blue-500/20">
                <div className="flex justify-between items-start mb-4">
                  <SourceBadge source={problem.source} verified={problem.verified} />
                  <Deadline date={problem.deadline} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{problem.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow line-clamp-3">
                  {problem.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {problem.prizeAmount > 0 ? `$${problem.prizeAmount.toLocaleString()} • ${problem.prizeType.replace("_", " ")}` : problem.prizeType.replace("_", " ")}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {problem.domain}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
