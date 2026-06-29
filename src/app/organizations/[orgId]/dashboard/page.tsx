import { getOrganization, getProblems, getSubmissions, getEvaluations } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, Play, Trophy, Users, Briefcase, PlusCircle, FileText, Code2, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import EvaluationActions from "@/app/organizations/dashboard/EvaluationActions";
import PostAnnouncementButton from "@/app/organizations/dashboard/PostAnnouncementButton";

export const dynamic = "force-dynamic";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export default async function OrgDashboard({ params, searchParams }: { params: Promise<{ orgId: string }>, searchParams: Promise<{ tab?: string }> }) {
  const { orgId } = await params;
  const tab = (await searchParams).tab || "challenges";
  
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  
  const role = user.publicMetadata?.role as string | undefined;
  const userOrgId = user.publicMetadata?.orgId as string | undefined;
  
  // Accept both 'organization' and 'company' roles
  if ((role !== "organization" && role !== "company") || (userOrgId && userOrgId !== orgId)) {
    redirect("/dashboard");
  }

  const [org, problemsRes] = await Promise.all([
    getOrganization(orgId),
    getProblems()
  ]);
  if (!org) notFound();

  const allProblems = problemsRes.items;
  // Match problems by both orgId AND by the org's clerkUserId (for backwards compat)
  const orgProblems = allProblems.filter(p =>
    p.postedByOrgId === orgId ||
    p.postedByOrgId === org.clerkUserId ||
    p.postedByOrgId === user.id
  );

  // Fetch submissions for ALL problems (not just the first)
  const problemsWithSubmissions = await Promise.all(
    orgProblems.map(async (problem) => {
      const subsRes = await getSubmissions(problem.problemId);
      const submissions = subsRes.items;
      
      // Attach 1:N evaluations
      for (const sub of submissions) {
        const evals = await getEvaluations(problem.problemId, sub.rankKey);
        (sub as any).evaluations = evals;
        
        if (evals.length > 0) {
          const sum = evals.reduce((acc, ev) => acc + ev.scores.innovation + ev.scores.technical + ev.scores.design, 0);
          (sub as any).meanScore = Math.round((sum / evals.length) * 10) / 10;
        } else {
          (sub as any).meanScore = 0;
        }
      }
      
      // Sort by mean score first, then fallback to basic score
      submissions.sort((a, b) => ((b as any).meanScore || b.score) - ((a as any).meanScore || a.score));
      return { ...problem, submissions };
    })
  );

  const totalSubmissions = problemsWithSubmissions.reduce((sum, p) => sum + p.submissions.length, 0);

  // Extract unique users across all submissions for the Talent Pool
  const userMap = new Map<string, { submissionCount: number, topScore: number, lastActive: string, name: string }>();
  for (const p of problemsWithSubmissions) {
    for (const sub of p.submissions) {
      const existing = userMap.get(sub.userId);
      const score = (sub as any).meanScore || sub.score;
      if (!existing) {
        userMap.set(sub.userId, {
          submissionCount: 1,
          topScore: score,
          lastActive: sub.submittedAt,
          name: sub.studentName || "Anonymous"
        });
      } else {
        existing.submissionCount += 1;
        existing.topScore = Math.max(existing.topScore, score);
        if (new Date(sub.submittedAt) > new Date(existing.lastActive)) {
          existing.lastActive = sub.submittedAt;
        }
      }
    }
  }

  // Fetch profiles for the talent pool
  const talentProfiles = await Promise.all(Array.from(userMap.entries()).map(async ([uId, meta]) => {
    try {
      const res = await docClient.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { userId: uId } }));
      return { userId: uId, meta, profile: res.Item || null };
    } catch(e) {
      return { userId: uId, meta, profile: null };
    }
  }));

  // Sort talent by top score descending
  talentProfiles.sort((a, b) => b.meta.topScore - a.meta.topScore);

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 mt-12 pb-24 space-y-8">
      {/* Header */}
      <div className="bg-transparent border border-white/10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-medium text-white tracking-tight mb-2">{org.orgName} Dashboard</h1>
          <p className="text-zinc-400 text-sm">Manage your posted problems and view top submissions.</p>
        </div>
        <Link href="/organizations/new" className="btn-primary px-5 py-2.5 text-sm font-medium flex items-center gap-2">
          <PlusCircle size={16} /> Post New Problem
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 mb-8 mt-4">
        <Link 
          href={`/organizations/${orgId}/dashboard?tab=challenges`}
          className={`pb-4 text-sm font-medium border-b-2 transition-colors ${tab === 'challenges' ? 'border-blue-400 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}
        >
          Challenges & Submissions
        </Link>
        <Link 
          href={`/organizations/${orgId}/dashboard?tab=talent`}
          className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${tab === 'talent' ? 'border-blue-400 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}
        >
          Talent Pool <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs leading-none">{talentProfiles.length}</span>
        </Link>
      </div>

      {tab === "challenges" ? (
        <>
          {/* Metrics */}
          <div className="flex flex-col md:flex-row border border-white/10 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
        {[
          { icon: <Briefcase size={16} />, label: "Active Problems", value: orgProblems.length },
          { icon: <Users size={16} />, label: "Total Submissions", value: totalSubmissions },
          { icon: <Trophy size={16} />, label: "Avg. per Problem", value: orgProblems.length > 0 ? Math.round(totalSubmissions / orgProblems.length) : 0 },
        ].map(({ icon, label, value }) => (
          <div key={label} className="p-6 flex-1 bg-white/5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {icon} {label}
            </div>
            <div className="text-3xl font-medium text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Problems + Submissions */}
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-white border-b border-white/10 pb-2">Your Active Problems</h2>
        {problemsWithSubmissions.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 p-16 text-center">
            <Briefcase size={32} className="mx-auto text-zinc-300 mb-4" />
            <p className="font-medium text-white text-lg mb-1">No problems posted yet</p>
            <p className="text-zinc-400 text-sm mb-6">Post your first challenge to start receiving submissions from top talent.</p>
            <Link href="/organizations/new" className="btn-primary px-6 py-2.5 font-medium text-sm inline-flex items-center gap-2">
              <PlusCircle size={16} /> Post First Challenge
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {problemsWithSubmissions.map(problem => (
              <div key={problem.problemId} className="border border-white/10 bg-transparent">
                {/* Problem header */}
                <div className="bg-white/5 border-b border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{problem.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Users size={14}/> {problem.submissions.length} Submission{problem.submissions.length !== 1 ? "s" : ""}</span>
                      <span>Deadline: {new Date(problem.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                  <Link href={`/problems/${problem.problemId}`} className="text-zinc-400 text-sm font-medium hover:text-blue-400 transition-colors whitespace-nowrap flex items-center gap-1.5">
                    View Public Page <ExternalLink size={14} />
                  </Link>
                  <PostAnnouncementButton problemId={problem.problemId} />
                </div>
                </div>

                {/* Submissions */}
                <div className="p-6">

                  {problem.submissions.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-sm italic border border-dashed border-white/10">
                      Awaiting submissions...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {problem.submissions.map((sub, idx) => (
                        <div key={sub.rankKey} className="bg-transparent border border-white/10 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="w-12 h-12 bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xl text-zinc-400 shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/profile/${sub.userId}`} className="font-medium text-white text-lg hover:text-blue-400 transition-colors">
                                {sub.studentName}
                              </Link>
                              <span className="bg-white/10 text-zinc-300 border border-white/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                                {((sub as any).evaluations && (sub as any).evaluations.length > 0) ? `Mean Score: ${(sub as any).meanScore} (${(sub as any).evaluations.length} Judges)` : `System Score: ${sub.score}`}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{sub.writeup}</p>
                            <div className="flex gap-4">
                              <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-400 hover:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                                <ExternalLink className="w-4 h-4" /> Repository
                              </a>
                              {sub.demoUrl && (
                                <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-400 hover:text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                                  <Play className="w-4 h-4" /> Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 mt-4 md:mt-0 w-full md:w-auto flex flex-col gap-2">
                            <Link
                              href={`/profile/${sub.userId}`}
                              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-blue-400 hover:text-blue-400 text-zinc-400 px-5 py-2 text-sm font-medium transition-colors w-full md:w-auto"
                            >
                              <FileText className="w-4 h-4" /> View Profile
                            </Link>
                            <EvaluationActions
                              problemId={problem.problemId}
                              rankKey={sub.rankKey}
                              prizeType={problem.prizeType || "CONTRACT"}
                              submitterName={sub.studentName}
                              studentUserId={sub.userId}
                              orgName={org.orgName as string || "Organization"}
                            />
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
      </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-xl font-medium text-white">Talent Pool</h2>
            <p className="text-sm text-zinc-400">Builders who participated in your challenges.</p>
          </div>

          {talentProfiles.length === 0 ? (
            <div className="bg-white/5 border border-dashed border-white/10 p-16 text-center">
              <Users size={32} className="mx-auto text-zinc-300 mb-4" />
              <p className="font-medium text-white text-lg mb-1">Your talent pool is empty</p>
              <p className="text-zinc-400 text-sm">Post a challenge to start attracting builders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {talentProfiles.map(talent => {
                const p = talent.profile || {};
                const name = p.name || talent.meta.name;
                return (
                  <div key={talent.userId} className="bg-transparent border border-white/10 hover:border-blue-400 transition-colors p-6 flex flex-col relative overflow-hidden">
                    {p.openToWork && (
                      <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 border-b border-l border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Open to Work
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4 mt-2">
                      <div className="w-12 h-12 bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center text-blue-400 text-xl font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/profile/${talent.userId}`} className="text-lg font-semibold text-white hover:text-blue-400 transition-colors line-clamp-1">
                          {name}
                        </Link>
                        {p.country && (
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} /> {p.country}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      {p.bio ? (
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{p.bio}</p>
                      ) : (
                        <p className="text-sm text-zinc-400 italic mb-4">No bio provided</p>
                      )}

                      {Array.isArray(p.skills) && p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {p.skills.slice(0, 4).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-zinc-400 border border-white/10">
                              {skill}
                            </span>
                          ))}
                          {p.skills.length > 4 && (
                            <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-400">+{p.skills.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 mt-auto mb-4">
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Top Score</div>
                        <div className="text-sm font-semibold text-white">{talent.meta.topScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Submissions</div>
                        <div className="text-sm font-semibold text-white">{talent.meta.submissionCount}</div>
                      </div>
                    </div>
                    <Link href={`/profile/${talent.userId}`} className="w-full py-2.5 bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider text-center hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-colors mt-auto">
                      View Profile & Contact
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
