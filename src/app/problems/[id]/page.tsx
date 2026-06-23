import { getProblem } from "@/lib/data";
import { notFound } from "next/navigation";
import { BadgeCheck, ExternalLink, CalendarDays, Trophy } from "lucide-react";
import Link from "next/link";
import ClientLeaderboard from "./ClientLeaderboard";
import ClientQA from "./ClientQA";

export const dynamic = "force-dynamic";

export default async function ProblemDetail({ params }: { params: { id: string } }) {
  const problem = await getProblem(params.id);

  if (!problem) {
    notFound();
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Header Section */}
      <div className="glass-panel p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
              {problem.source.replace("_", " ")}
              {problem.verified && <BadgeCheck className="w-4 h-4" />}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">{problem.title}</h1>
          </div>
          <Link href={`/problems/${problem.problemId}/submit`} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 whitespace-nowrap">
            Submit Solution
          </Link>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
          {problem.description}
        </p>

        <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Prize: {problem.prizeType === 'CASH' ? `$${problem.prizeAmount}` : problem.prizeType.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarDays className="w-5 h-5" />
            <span>Deadline: {new Date(problem.deadline).toLocaleDateString()}</span>
          </div>
          {problem.sourceUrl && (
            <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
              <ExternalLink className="w-5 h-5" />
              <span>Original Source</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <ClientLeaderboard problemId={problem.problemId} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Q&A Thread</h2>
          <ClientQA problemId={problem.problemId} />
        </div>
      </div>
    </div>
  );
}
