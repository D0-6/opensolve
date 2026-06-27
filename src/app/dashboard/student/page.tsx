import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import {
  Trophy,
  GitBranch,
  Search,
  ArrowRight,
  Flame,
  Star,
  Zap,
} from "lucide-react";

const SUBMISSIONS_TABLE =
  process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  // Redirect any non-student to the root dispatcher which will route correctly
  if (role && role !== "student") redirect("/dashboard");

  // Fetch this user's submissions
  let submissions: Record<string, unknown>[] = [];
  try {
    const res = await docClient.send(
      new QueryCommand({
        TableName: SUBMISSIONS_TABLE,
        IndexName: "userId-submittedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        ScanIndexForward: false,
        Limit: 10,
      })
    );
    submissions = res.Items || [];
  } catch (err) {
    console.error("Error fetching student submissions:", err);
  }

  const totalScore = submissions.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
  const firstName = user?.firstName || "Builder";

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 pt-24 pb-24 bg-white min-h-screen">
      {/* Welcome header */}
      <div className="mb-12 border-b border-zinc-200 pb-12">
        <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 w-fit text-xs font-semibold text-zinc-600 mb-6 uppercase tracking-wide">
          <Zap size={14} /> Student Dashboard
        </div>
        
        <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 leading-tight">
          Welcome back, {firstName} 👋
        </h1>
        
        <p className="text-zinc-500 text-base mt-2">
          Keep building. Every submission moves you closer to your next opportunity.
        </p>

        {/* Stats row */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200 border border-zinc-200 mt-8">
          {[
            { icon: <Trophy size={16} />, label: "Total Score", value: totalScore },
            { icon: <GitBranch size={16} />, label: "Submissions", value: submissions.length },
            { icon: <Flame size={16} />, label: "Rank", value: submissions.length > 0 ? "Active" : "—" },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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
      </div>

      {/* Recent submissions */}
      <div>
        <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2">
          Recent Submissions
        </h2>
        {submissions.length === 0 ? (
          <div className="border border-zinc-200 border-dashed p-12 text-center text-zinc-500">
            <Trophy size={32} className="mx-auto mb-4 opacity-50 text-zinc-300" />
            <p className="font-medium text-zinc-900 text-lg mb-1">No submissions yet</p>
            <p className="text-sm mb-6">Start solving problems to build your portfolio.</p>
            <Link href="/" className="btn-primary px-6 py-2.5 font-medium text-sm">
              Browse Problems
            </Link>
          </div>
        ) : (
          <div className="flex flex-col border-t border-zinc-200">
            {submissions.map((sub) => (
              <div
                key={`${sub.problemId}-${sub.submittedAt}`}
                className="border-b border-zinc-200 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:bg-zinc-50 px-4 transition-colors -mx-4"
              >
                <div>
                  <Link
                    href={`/problems/${sub.problemId}`}
                    className="font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors text-lg"
                  >
                    View Problem →
                  </Link>
                  <p className="text-sm text-zinc-500 mt-1">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-white border border-zinc-200 px-4 py-2 font-bold text-zinc-900 text-sm">
                    Score: {sub.score ?? "—"}
                  </div>
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
                    >
                      <GitBranch size={16} />
                    </a>
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
