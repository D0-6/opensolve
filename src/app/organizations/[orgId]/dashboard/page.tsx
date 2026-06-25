import { getOrganization, getProblems, getSubmissions } from "@/lib/data";
import { notFound } from "next/navigation";
import { Mail, ExternalLink, Play } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrgDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
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
    <div className="max-w-5xl mx-auto mt-12 space-y-8">
      <div className="glass-panel p-8 rounded-3xl mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{org.orgName} Dashboard</h1>
          <p className="text-slate-500">Manage your posted problems and view top submissions.</p>
        </div>
        <Link href="/organizations/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Post New Problem
        </Link>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Active Problems</h2>
        {orgProblems.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center text-slate-500">
            You haven't posted any problems yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgProblems.map(p => (
              <div key={p.problemId} className="glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500">
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <div className="text-sm text-slate-500 mb-3">Deadline: {new Date(p.deadline).toLocaleDateString()}</div>
                <Link href={`/problems/${p.problemId}`} className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                  View Public Page <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {exampleProblem && (
        <div className="space-y-6 mt-12">
          <h2 className="text-2xl font-bold">Top Submissions for: {exampleProblem.title}</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <strong>Note:</strong> In this hackathon version, "Contact" opens a pre-filled mailto link. Phase 2 adds in-app messaging.
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="glass-panel p-8 rounded-xl text-center text-slate-500">
                No submissions received yet.
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <div key={sub.rankKey} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-xl text-slate-500 shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/profile/${sub.userId}`} className="font-bold text-lg hover:text-blue-500 transition-colors">
                        {sub.studentName}
                      </Link>
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Score: {sub.score}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{sub.writeup}</p>
                    <div className="flex gap-4">
                      <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-blue-500 flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Repository
                      </a>
                      {sub.demoUrl && (
                        <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-blue-500 flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <a 
                      href={`mailto:mock-${sub.userId}@opensolve.demo?subject=Regarding your solution to ${exampleProblem.title}`}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-semibold transition-colors"
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
