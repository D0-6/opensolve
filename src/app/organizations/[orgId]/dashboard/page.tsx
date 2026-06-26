import { getOrganization, getProblems, getSubmissions } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Mail, ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function OrgDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "organization" || user.publicMetadata?.orgId !== orgId) {
    redirect("/sign-in");
  }

  const org = await getOrganization(orgId);
  if (!org) notFound();

  // For the hackathon demo, just fetch all problems and filter by postedByOrgId locally
  const allProblems = await getProblems();
  const orgProblems = allProblems.filter(p => p.postedByOrgId === org.orgId);

  // We will just show submissions for the first problem as an example
  const exampleProblem = orgProblems[0];
  const submissions = exampleProblem ? await getSubmissions(exampleProblem.problemId) : [];
  
  // Sort descending by score
  submissions.sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-[1250px] mx-auto mt-12 space-y-8 px-6">
      <div className="bg-white border border-zinc-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight mb-2">{org.orgName} Dashboard</h1>
          <p className="text-zinc-500 text-sm">Manage your posted problems and view top submissions.</p>
        </div>
        <Link href="/organizations/new" className="bg-[#1a3a5c] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#112740] transition-colors flex items-center gap-2">
          Post New Problem
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-medium text-zinc-900 border-b border-zinc-200 pb-2">Your Active Problems</h2>
        {orgProblems.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 p-8 text-center text-zinc-500 text-sm">
            You haven't posted any problems yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgProblems.map(p => (
              <div key={p.problemId} className="bg-white border border-zinc-200 p-6 hover:border-[#1a3a5c] transition-colors group relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#1a3a5c] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-medium text-zinc-900 text-lg mb-2">{p.title}</h3>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-4">Deadline: {new Date(p.deadline).toLocaleDateString()}</div>
                <Link href={`/problems/${p.problemId}`} className="text-[#1a3a5c] text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
                  View Public Page <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {exampleProblem && (
        <div className="space-y-6 mt-16">
          <h2 className="text-xl font-medium text-zinc-900 border-b border-zinc-200 pb-2">Top Submissions for: {exampleProblem.title}</h2>
          
          <div className="bg-zinc-50 p-4 text-sm text-zinc-600 border border-zinc-200">
            <strong>Note:</strong> In this hackathon version, "Contact" opens a pre-filled mailto link. Phase 2 adds in-app messaging.
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-500 text-sm">
                No submissions received yet.
              </div>
            ) : (
              submissions.map((sub, idx) => (
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
                    <p className="text-sm text-zinc-600 mb-4">{sub.writeup}</p>
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
                      href={`mailto:mock-${sub.userId}@opensolve.demo?subject=Regarding your solution to ${exampleProblem.title}`}
                      className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white px-5 py-2.5 text-sm font-medium transition-colors w-full md:w-auto"
                    >
                      <Mail className="w-4 h-4" /> Contact
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
