import { getProblems } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { BadgeCheck, Clock, Building, Zap, Code } from "lucide-react";
import { cn } from "@/lib/utils";

// Make the page dynamic so it fetches fresh data
export const dynamic = "force-dynamic";

function SourceBadge({ source, verified }: { source: string; verified?: boolean }) {
  const colors: Record<string, string> = {
    "YC_STARTUP": "bg-accent-light text-warning border-accent",
    "GOVERNMENT": "bg-primary-lighter/20 text-primary-light border-primary-lighter/40",
    "INDUSTRY": "bg-background-secondary text-text-secondary border-border",
  };
  
  return (
    <div className={cn("px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5", colors[source] || colors["INDUSTRY"])}>
      {source.replace("_", " ")}
      {verified && <BadgeCheck className="w-3 h-3" />}
    </div>
  );
}

function Deadline({ date }: { date: string }) {
  const targetDate = new Date(date);
  const hoursLeft = differenceInHours(targetDate, new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft < 48;
  const isPast = hoursLeft <= 0;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", isUrgent ? "text-error" : isPast ? "text-text-secondary" : "text-success")}>
      <Clock className="w-3.5 h-3.5" />
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
    <div className="space-y-16">
      <div className="text-center space-y-6 py-8">
        <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-tight">
          Connect talent with<br />
          <span className="text-primary">real opportunities</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          A curated marketplace where developers solve funded challenges from leading startups, government innovation teams, and top industry leaders.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-12">
          <Link href="/organizations/new" className="group card-base p-8 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary-light transition-colors">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-serif font-semibold mb-2 text-foreground">Post a Problem</h2>
            <p className="text-sm text-text-secondary">Fund solutions and connect with talented developers ready to solve your challenges.</p>
          </Link>

          <a href="#problems" className="group card-base p-8 rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary-light transition-colors">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-serif font-semibold mb-2 text-foreground">Solve Problems</h2>
            <p className="text-sm text-text-secondary">Browse real funded challenges and showcase your expertise to earn rewards.</p>
          </a>
        </div>
      </div>

      <div id="problems" className="pt-8 scroll-mt-24">
        <div className="flex items-center gap-3 mb-10">
          <h2 className="text-3xl font-serif font-semibold text-foreground">Active Opportunities</h2>
          <div className="text-sm font-medium text-text-secondary bg-background-secondary px-3 py-1 rounded-full">
            {problems.length} live
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.length === 0 ? (
          <div className="col-span-full text-center py-16 text-text-secondary card-base rounded-xl border-2 border-dashed border-border">
            <Zap className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No problems found yet. Check back soon!</p>
          </div>
        ) : (
          problems.map((problem) => (
            <Link href={`/problems/${problem.problemId}`} key={problem.problemId} className="group block h-full">
              <div className="card-base p-6 rounded-xl h-full flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <SourceBadge source={problem.source} verified={problem.verified} />
                  <Deadline date={problem.deadline} />
                </div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2 text-foreground">{problem.title}</h3>
                <p className="text-sm text-text-secondary mb-6 flex-grow line-clamp-3">
                  {problem.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <Zap className="w-4 h-4" />
                    {problem.prizeAmount > 0 ? `$${problem.prizeAmount.toLocaleString()}` : "Varies"}
                  </div>
                  <div className="text-xs text-text-secondary">{problem.domain}</div>
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
