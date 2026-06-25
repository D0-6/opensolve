import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProblems, getSubmissions } from "@/lib/data";
import Link from "next/link";
import {
  PlusCircle,
  ExternalLink,
  Users,
  Trophy,
  BarChart3,
  Building2,
  ArrowRight,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompanyDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role && role !== "company") redirect("/dashboard/student");

  const orgName = user?.firstName ? `${user.firstName}'s Org` : "Your Organization";

  // Fetch all problems and filter by this user's org
  const allProblems = await getProblems();
  const myProblems = allProblems.filter((p: any) => p.postedByOrgId === userId);

  // Fetch submissions for all my problems
  const submissionsByProblem: Record<string, any[]> = {};
  let totalSubmissions = 0;
  for (const p of myProblems) {
    const subs = await getSubmissions(p.problemId);
    submissionsByProblem[p.problemId] = subs;
    totalSubmissions += subs.length;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 pt-10 pb-24 w-full">
      {/* Header */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 mb-10 flex flex-wrap gap-6 items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-fit text-xs font-bold text-white mb-4">
            <Building2 size={14} /> Company Dashboard
          </div>
          <h1 className="text-3xl md:text-5xl font-display-lg font-bold text-white mb-2">
            {orgName}
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Manage your challenges and discover top talent.
          </p>
        </div>

        <Link
          href="/organizations/new"
          className="btn-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Post a Challenge
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <Zap size={20} />, label: "Active Challenges", value: myProblems.length },
          { icon: <Users size={20} />, label: "Total Submissions", value: totalSubmissions },
          { icon: <Trophy size={20} />, label: "Top Solvers", value: totalSubmissions > 0 ? "View →" : "—" },
          { icon: <BarChart3 size={20} />, label: "Avg. Submissions", value: myProblems.length > 0 ? Math.round(totalSubmissions / myProblems.length) : 0 },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="text-zinc-400 mb-2">{icon}</div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-zinc-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Posted Challenges */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Challenges</h2>
          <Link
            href="/organizations/new"
            className="text-sm text-white hover:text-zinc-300 transition-colors flex items-center gap-1 font-semibold"
          >
            Post New <ArrowRight size={16} />
          </Link>
        </div>

        {myProblems.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-16 text-center">
            <Building2 size={48} className="mx-auto mb-4 text-zinc-600" />
            <p className="font-bold text-white text-xl mb-2">No challenges posted yet</p>
            <p className="text-zinc-400 text-sm mb-6">
              Post your first challenge and start finding top builders
            </p>
            <Link
              href="/organizations/new"
              className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-max mx-auto"
            >
              <PlusCircle size={18} /> Post First Challenge
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {myProblems.map((problem: any) => {
              const subs = submissionsByProblem[problem.problemId] || [];
              const topSub = subs.sort((a: any, b: any) => b.score - a.score)[0];
              return (
                <div
                  key={problem.problemId}
                  className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors border-l-4 border-l-white"
                >
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-xl font-bold text-white mb-1">{problem.title}</h3>
                      <p className="text-sm text-zinc-400">
                        Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-sm text-white font-bold">
                        {subs.length} Submission{subs.length !== 1 ? "s" : ""}
                      </div>
                      <Link
                        href={`/problems/${problem.problemId}`}
                        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={16} /> View Public
                      </Link>
                    </div>
                  </div>

                  {/* Top submission preview */}
                  {topSub && (
                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">
                          🥇 Top Submission
                        </div>
                        <div className="font-bold text-white text-base">{topSub.studentName || "Anonymous"}</div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white font-bold">
                          Score: {topSub.score}
                        </span>
                        <a
                          href={`mailto:${topSub.userId}@placeholder.com?subject=Your solution to: ${problem.title}`}
                          className="btn-primary px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          Contact
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
