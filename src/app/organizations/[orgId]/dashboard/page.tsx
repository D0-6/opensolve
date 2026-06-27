import { getOrganization, getProblems, getSubmissions } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Mail, ExternalLink, Play, Trophy, Users, Briefcase, PlusCircle } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function OrgDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  
  const user = await currentUser();
  // Redirect unauthenticated users to sign-in; redirect authenticated users
  // with wrong role to the dashboard dispatcher rather than sign-in.
  if (!user) {
    redirect("/sign-in");
  }
  if (user.publicMetadata?.role !== "organization" || user.publicMetadata?.orgId !== orgId) {
    redirect("/dashboard");
  }

  const org = await getOrganization(orgId);
  if (!org) notFound();

  const allProblems = await getProblems();
  const orgProblems = allProblems.filter(p => p.postedByOrgId === org.orgId);

  // Fetch submissions for ALL problems (not just the first)
  const problemsWithSubmissions = await Promise.all(
    orgProblems.map(async (problem) => {
      const submissions = await getSubmissions(problem.problemId);
      submissions.sort((a, b) => b.score - a.score);
      return { ...problem, submissions };
    })
  );

  const totalSubmissions = problemsWithSubmissions.reduce((sum, p) => sum + p.submissions.length, 0);

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 mt-12 pb-24 space-y-8">
      {/* Header */}
      <div className="bg-white border border-zinc-200 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight mb-2">{org.orgName} Dashboard</h1>
          <p className="text-zinc-500 text-sm">Manage your posted problems and view top submissions.</p>
        </div>
        <Link href="/organizations/new" className="btn-primary px-5 py-2.5 text-sm font-medium flex items-center gap-2">
          <PlusCircle size={16} /> Post New Problem
        </Link>
      </div>

      {/* Metrics */}
      <div className="flex flex-col md:flex-row border border-zinc-200 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
        {[
          { icon: <Briefcase size={16} />, label: "Active Problems", value: orgProblems.length },
          { icon: <Users size={16} />, label: "Total Submissions", value: totalSubmissions },
          { icon: <Trophy size={16} />, label: "Avg. per Problem", value: orgProblems.length > 0 ? Math.round(totalSubmissions / orgProblems.length) : 0 },
        ].map(({ icon, label, value }) => (
          <div key={label} className="p-6 flex-1 bg-zinc-50">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {icon} {label}
            </div>
            <div className="text-3xl font-medium text-zinc-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Problems + Submissions */}
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-zinc-900 border-b border-zinc-200 pb-2">Your Active Problems</h2>
        {problemsWithSubmissions.length === 0 ? (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 p-16 text-center">
            <Briefcase size={32} className="mx-auto text-zinc-300 mb-4" />
            <p className="font-medium text-zinc-900 text-lg mb-1">No problems posted yet</p>
            <p className="text-zinc-500 text-sm mb-6">Post your first challenge to start receiving submissions from top talent.</p>
            <Link href="/organizations/new" className="btn-primary px-6 py-2.5 font-medium text-sm inline-flex items-center gap-2">
              <PlusCircle size={16} /> Post First Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {problemsWithSubmissions.map(problem => (
              <div key={problem.problemId} className="border border-zinc-200 bg-white">
                {/* Problem header */}
                <div className="bg-zinc-50 border-b border-zinc-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900">{problem.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Users size={14}/> {problem.submissions.length} Submission{problem.submissions.length !== 1 ? "s" : ""}</span>
                      <span>Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  <Link href={`/problems/${problem.problemId}`} className="text-zinc-500 text-sm font-medium hover:text-[#1a3a5c] transition-colors whitespace-nowrap flex items-center gap-1.5">
                    View Public Page <ExternalLink size={14} />
                  </Link>
                </div>

                {/* Submissions */}
                <div className="p-6">
                  <div className="bg-zinc-50 p-3 text-xs text-zinc-600 border border-zinc-200 mb-4">
                    <strong>Note:</strong> &quot;Contact&quot; opens a pre-filled mailto link. Phase 2 adds in-app messaging.
                  </div>
                  {problem.submissions.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-sm italic border border-dashed border-zinc-200">
                      Awaiting submissions...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {problem.submissions.map((sub, idx) => (
                        <div key={sub.rankKey} className="bg-white border border-zinc-200 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xl text-zinc-500 shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/profile/${sub.userId}`} className="font-medium text-zinc-900 text-lg hover:text-[#1a3a5c] transition-colors">
                                {sub.studentName}
                              </Link>
                              <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                                Score: {sub.score}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 mb-4 line-clamp-2">{sub.writeup}</p>
                            <div className="flex gap-4">
                              <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] flex items-center gap-1 uppercase tracking-wider">
                                <ExternalLink className="w-4 h-4" /> Repository
                              </a>
                              {sub.demoUrl && (
                                <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] flex items-center gap-1 uppercase tracking-wider">
                                  <Play className="w-4 h-4" /> Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto">
                            <a
                              href={`mailto:${sub.userId}@placeholder.com?subject=Regarding your solution to: ${problem.title}`}
                              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 text-sm font-medium transition-colors w-full md:w-auto"
                            >
                              <Mail className="w-4 h-4" /> Contact
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
