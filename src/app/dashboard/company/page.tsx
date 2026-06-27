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
  // Redirect any non-company user to the root dispatcher
  if (role && role !== "company") redirect("/dashboard");

  const orgName = user?.firstName ? `${user.firstName}'s Org` : "Your Organization";

  // Fetch all problems and handle paginated response
  const problemsRes = await getProblems();
  const allProblems = problemsRes.items;
  const myProblems = allProblems.filter((p: any) => p.postedByOrgId === userId);

  // Fetch submissions for all my problems
  const submissionsByProblem: Record<string, any[]> = {};
  let totalSubmissions = 0;
  for (const p of myProblems) {
    const subsRes = await getSubmissions(p.problemId);
    const subs = subsRes.items;
    submissionsByProblem[p.problemId] = subs;
    totalSubmissions += subs.length;
  }

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 pt-24 pb-24 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-12 border-b border-zinc-200 pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 w-fit text-xs font-semibold text-zinc-600 mb-6 uppercase tracking-wide">
            <Building2 size={14} /> Company Dashboard
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-zinc-900 mb-2 tracking-tight">
            {orgName}
          </h1>
          <p className="text-zinc-500 text-base">
            Manage your challenges and discover top talent.
          </p>
        </div>

        <Link
          href="/organizations/new"
          className="btn-primary px-6 py-3 font-medium flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={18} />
          Post a Challenge
        </Link>
      </div>

      {/* Metric strip */}
      <div className="flex flex-col md:flex-row border border-zinc-200 divide-y md:divide-y-0 md:divide-x divide-zinc-200 mb-16">
        {[
          { icon: <Zap size={16} />, label: "Active Challenges", value: myProblems.length },
          { icon: <Users size={16} />, label: "Total Submissions", value: totalSubmissions },
          { icon: <Trophy size={16} />, label: "Top Solvers", value: totalSubmissions > 0 ? "View →" : "—" },
          { icon: <BarChart3 size={16} />, label: "Avg. Submissions", value: myProblems.length > 0 ? Math.round(totalSubmissions / myProblems.length) : 0 },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="p-6 flex-1 bg-zinc-50"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {icon} {label}
            </div>
            <div className="text-3xl font-medium text-zinc-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Posted Challenges */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-2">
          <h2 className="text-xl font-medium text-zinc-900">Your Challenges</h2>
          <Link
            href="/organizations/new"
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 font-medium"
          >
            Post New <ArrowRight size={16} />
          </Link>
        </div>

        {myProblems.length === 0 ? (
          <div className="border border-zinc-200 border-dashed p-16 text-center">
            <Building2 size={32} className="mx-auto mb-4 text-zinc-300" />
            <p className="font-medium text-zinc-900 text-lg mb-1">No challenges posted yet</p>
            <p className="text-zinc-500 text-sm mb-6">
              Post your first challenge and start finding top builders
            </p>
            <Link
              href="/organizations/new"
              className="btn-primary px-6 py-2.5 font-medium flex items-center gap-2 w-max mx-auto text-sm"
            >
              <PlusCircle size={16} /> Post First Challenge
            </Link>
          </div>
        ) : (
          <div className="flex flex-col border-t border-zinc-200">
            {myProblems.map((problem: Record<string, unknown>) => {
              const subs = submissionsByProblem[problem.problemId] || [];
              const topSub = subs.sort((a: Record<string, unknown>, b: Record<string, unknown>) => Number(b.score) - Number(a.score))[0];
              return (
                <div
                  key={problem.problemId}
                  className="border-b border-zinc-200 py-6 px-4 hover:bg-zinc-50 transition-colors -mx-4 group border-l-4 border-l-transparent hover:border-l-[#1a3a5c]"
                >
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="text-lg font-semibold text-zinc-900 mb-1 group-hover:text-[#1a3a5c] transition-colors">{problem.title}</h3>
                      <p className="text-sm text-zinc-500">
                        Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div className="flex gap-4 items-center flex-wrap">
                      <div className="border border-zinc-300 rounded px-3 py-1 text-xs font-semibold text-zinc-600 bg-white">
                        {subs.length} Submission{subs.length !== 1 ? "s" : ""}
                      </div>
                      <Link
                        href={`/problems/${problem.problemId}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                      >
                        <ExternalLink size={16} /> Public View
                      </Link>
                    </div>
                  </div>

                  {/* Top submission preview */}
                  {topSub && (
                    <div className="mt-6 p-4 bg-white border border-zinc-200 flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-[10px] text-zinc-400 mb-1 uppercase tracking-widest font-bold">
                          Top Submission
                        </div>
                        <div className="font-semibold text-zinc-900 text-sm">{topSub.studentName || "Anonymous"}</div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="bg-zinc-100 border border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-900">
                          Score: {topSub.score}
                        </span>
                        <a
                          href={`mailto:${topSub.userId}@placeholder.com?subject=Your solution to: ${problem.title}`}
                          className="btn-primary px-4 py-2 text-xs font-medium"
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
