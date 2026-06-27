import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import {
  Trophy,
  GitBranch,
  Search,
  ArrowRight,
  Flame,
  Star,
  Zap,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { NotificationsPanel, EvalStatusBadge } from "./StudentDashboardClient";

const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role && role !== "student") redirect("/dashboard");

  const firstName = user?.firstName || "Builder";
  const fullName = user?.fullName || user?.firstName || "Builder";

  // Fetch submissions
  let submissions: Record<string, unknown>[] = [];
  try {
    const res = await docClient.send(
      new QueryCommand({
        TableName: SUBMISSIONS_TABLE,
        IndexName: "userId-submittedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        ScanIndexForward: false,
        Limit: 20,
      })
    );
    submissions = res.Items || [];
  } catch (err) {
    console.error("Error fetching submissions:", err);
  }

  // Fetch applications (scan with filter — add a GSI in production for scale)
  let applications: Record<string, unknown>[] = [];
  try {
    const res = await docClient.send(
      new ScanCommand({
        TableName: APPLICATIONS_TABLE,
        FilterExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      })
    );
    applications = (res.Items || []).sort(
      (a, b) => String(b.appliedAt || "").localeCompare(String(a.appliedAt || ""))
    );
  } catch (err) {
    console.error("Error fetching applications:", err);
  }

  // Fetch problem titles for applications and submissions
  const allProblemIds = [
    ...new Set([
      ...applications.map(a => String(a.problemId)),
      ...submissions.map(s => String(s.problemId)),
    ])
  ];
  const problemCache: Record<string, Record<string, unknown>> = {};
  for (const pid of allProblemIds.slice(0, 40)) {
    try {
      const res = await docClient.send(new GetCommand({ TableName: PROBLEMS_TABLE, Key: { problemId: pid } }));
      if (res.Item) problemCache[pid] = res.Item;
    } catch (err) {
      console.error(err);
    }
  }

  const totalScore = submissions.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
  const bestSubmission = submissions.reduce<Record<string, unknown> | null>((best, s) => {
    if (!best || Number(s.score) > Number(best.score)) return s;
    return best;
  }, null);

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 pt-24 pb-24 bg-white min-h-screen">

      {/* Welcome header */}
      <div className="mb-12 border-b border-zinc-200 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 w-fit text-xs font-semibold text-zinc-600 mb-4 uppercase tracking-wide">
              <Zap size={14} /> Student Dashboard
            </div>
            <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-zinc-500 text-base mt-2">
              Keep building. Every submission moves you closer to your next opportunity.
            </p>
          </div>
          <NotificationsPanel userId={userId} />
        </div>

        {/* Stats row */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200 border border-zinc-200">
          {[
            { icon: <Trophy size={16} />, label: "Total Score", value: totalScore },
            { icon: <GitBranch size={16} />, label: "Submissions", value: submissions.length },
            { icon: <FileText size={16} />, label: "Applications", value: applications.length },
            {
              icon: <Flame size={16} />,
              label: "Best Score",
              value: bestSubmission ? Number(bestSubmission.score) : "—",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="p-6 flex-1 bg-zinc-50">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {icon} {label}
              </div>
              <div className="text-3xl font-medium text-zinc-900">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Link
          href="/"
          className="border border-zinc-200 bg-white p-6 flex flex-col gap-4 group hover:bg-zinc-50 transition-colors"
        >
          <div className="w-10 h-10 border border-zinc-200 text-zinc-600 flex items-center justify-center bg-white group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors">
            <Search size={18} />
          </div>
          <div>
            <div className="font-medium text-zinc-900 text-lg mb-1">Browse Challenges</div>
            <div className="text-sm text-zinc-500">Find your next problem to solve</div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 mt-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href={`/profile/${userId}`}
          className="border border-zinc-200 bg-white p-6 flex flex-col gap-4 group hover:bg-zinc-50 transition-colors"
        >
          <div className="w-10 h-10 border border-zinc-200 text-zinc-600 flex items-center justify-center bg-white group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors">
            <Star size={18} />
          </div>
          <div>
            <div className="font-medium text-zinc-900 text-lg mb-1">My Public Profile</div>
            <div className="text-sm text-zinc-500">View how companies see you</div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 mt-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/leaderboard"
          className="border border-zinc-200 bg-white p-6 flex flex-col gap-4 group hover:bg-zinc-50 transition-colors"
        >
          <div className="w-10 h-10 border border-zinc-200 text-zinc-600 flex items-center justify-center bg-white group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors">
            <Trophy size={18} />
          </div>
          <div>
            <div className="font-medium text-zinc-900 text-lg mb-1">Global Leaderboard</div>
            <div className="text-sm text-zinc-500">See where you rank against all builders</div>
          </div>
          <ArrowRight size={18} className="text-zinc-400 mt-auto group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* === APPLICATIONS SECTION === */}
      <div className="mb-16">
        <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2 flex items-center gap-2">
          <Clock size={20} className="text-zinc-400" /> My Applications
        </h2>

        {applications.length === 0 ? (
          <div className="border border-dashed border-zinc-200 p-10 text-center text-zinc-500">
            <FileText size={28} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-medium text-zinc-700 mb-1">No applications yet</p>
            <p className="text-sm mb-4">Apply to a challenge to start tracking your progress.</p>
            <Link href="/challenges" className="btn-primary px-5 py-2 text-sm inline-block">Browse Challenges</Link>
          </div>
        ) : (
          <div className="flex flex-col border-t border-zinc-200">
            {applications.map(app => {
              const problem = problemCache[String(app.problemId)];
              const hasSubmission = submissions.some(s => s.problemId === app.problemId);
              const teamCount = Array.isArray(app.teamMembers) ? app.teamMembers.length : 0;

              return (
                <div
                  key={`${app.problemId}-${app.appliedAt}`}
                  className="border-b border-zinc-100 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-zinc-50 px-4 -mx-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/problems/${app.problemId}`}
                      className="font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors text-base block truncate"
                    >
                      {problem ? String(problem.title) : `Problem ${String(app.problemId).slice(-8)}`}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-400">
                      {problem?.domain && <span>{String(problem.domain)}</span>}
                      <span>Applied {new Date(String(app.appliedAt)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {teamCount > 0 && <span>Team of {teamCount + 1}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {hasSubmission ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> Solution Submitted
                      </span>
                    ) : (
                      <Link href={`/problems/${app.problemId}/team`} className="text-xs font-bold text-[#1a3a5c] hover:underline uppercase tracking-wider">
                        Continue →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* === SUBMISSIONS SECTION === */}
      <div>
        <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2 flex items-center gap-2">
          <GitBranch size={20} className="text-zinc-400" /> Recent Submissions
        </h2>

        {submissions.length === 0 ? (
          <div className="border border-dashed border-zinc-200 p-12 text-center text-zinc-500">
            <Trophy size={32} className="mx-auto mb-4 opacity-50 text-zinc-300" />
            <p className="font-medium text-zinc-900 text-lg mb-1">No submissions yet</p>
            <p className="text-sm mb-6">Start solving problems to build your portfolio.</p>
            <Link href="/challenges" className="btn-primary px-6 py-2.5 font-medium text-sm">
              Browse Problems
            </Link>
          </div>
        ) : (
          <div className="flex flex-col border-t border-zinc-200">
            {submissions.map(sub => {
              const problem = problemCache[String(sub.problemId)];
              const evalStatus = sub.evaluationStatus as string || "PENDING";
              const teamMembers = Array.isArray(sub.teamMembers) ? sub.teamMembers : [];
              const orgId = problem?.postedByOrgId as string | undefined;
              const threadId = `${sub.problemId}#${userId}`;

              return (
                <div
                  key={`${sub.problemId}-${sub.submittedAt}`}
                  className="border-b border-zinc-100 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-zinc-50 px-4 -mx-4 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/problems/${sub.problemId}`}
                      className="font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors text-lg block truncate"
                    >
                      {problem ? String(problem.title) : `Challenge #${String(sub.problemId).slice(-8)}`}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-zinc-400">
                      {problem?.domain && <span>{String(problem.domain)}</span>}
                      <span>Submitted {new Date(String(sub.submittedAt)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {teamMembers.length > 0 && <span>Team of {teamMembers.length + 1}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <EvalStatusBadge status={evalStatus} />
                    <div className="bg-white border border-zinc-200 px-3 py-1.5 font-bold text-zinc-900 text-sm">
                      Score: {sub.score ?? "—"}
                    </div>
                    {sub.githubUrl && (
                      <a
                        href={String(sub.githubUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-9 h-9 border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
                        title="View Repository"
                      >
                        <GitBranch size={15} />
                      </a>
                    )}
                    {orgId && (
                      <div className="hidden md:block">
                        {/* Message thread with org — imported as client component */}
                        {/* We import this inside the client boundary via the layout */}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
