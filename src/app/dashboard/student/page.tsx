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
  if (role && role !== "student") redirect("/dashboard/company");

  // Fetch this user's submissions
  let submissions: any[] = [];
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

  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const firstName = user?.firstName || "Builder";

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 pt-10 pb-24 w-full">
      {/* Welcome header */}
      <div className="bg-gradient-to-br from-[#00cbe6]/10 to-[#a078ff]/10 border border-[#00cbe6]/20 rounded-3xl p-8 md:p-12 mb-10 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-radial-gradient from-[#00cbe6]/20 to-transparent blur-2xl rounded-full" />
        
        <div className="inline-flex items-center gap-2 bg-[#00cbe6]/15 border border-[#00cbe6]/30 rounded-full px-4 py-1.5 w-fit text-xs font-bold text-[#00cbe6]">
          <Zap size={14} /> Student Dashboard
        </div>
        
        <h1 className="text-3xl md:text-5xl font-display-lg font-bold leading-tight text-[#dce1fb]">
          Welcome back, {firstName} 👋
        </h1>
        
        <p className="text-[#8990a8] text-base md:text-lg">
          Keep building. Every submission moves you closer to your next opportunity.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { icon: <Trophy size={18} />, label: "Total Score", value: totalScore, color: "text-[#facc15]" },
            { icon: <GitBranch size={18} />, label: "Submissions", value: submissions.length, color: "text-[#00cbe6]" },
            { icon: <Flame size={18} />, label: "Rank", value: submissions.length > 0 ? "Active" : "—", color: "text-[#fb923c]" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[140px] flex-1 md:flex-none">
              <div className={`flex items-center gap-2 mb-2 text-sm font-bold ${color}`}>
                {icon} {label}
              </div>
              <div className="text-3xl font-bold text-[#dce1fb]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/"
          className="glass glass-card-hover rounded-2xl p-6 flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#00cbe6]/15 text-[#00cbe6] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Search size={20} />
          </div>
          <div>
            <div className="font-bold text-[#dce1fb] text-lg mb-1">Browse Challenges</div>
            <div className="text-sm text-[#8990a8]">Find your next problem to solve</div>
          </div>
          <ArrowRight size={20} className="text-[#8990a8] mt-auto group-hover:text-[#00cbe6] transition-colors" />
        </Link>

        <Link
          href={`/profile/${userId}`}
          className="glass glass-card-hover rounded-2xl p-6 flex flex-col gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-[#a078ff]/15 text-[#a078ff] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star size={20} />
          </div>
          <div>
            <div className="font-bold text-[#dce1fb] text-lg mb-1">My Public Profile</div>
            <div className="text-sm text-[#8990a8]">View how companies see you</div>
          </div>
          <ArrowRight size={20} className="text-[#8990a8] mt-auto group-hover:text-[#a078ff] transition-colors" />
        </Link>
      </div>

      {/* Recent submissions */}
      <div>
        <h2 className="text-2xl font-bold text-[#dce1fb] mb-6">
          Recent Submissions
        </h2>
        {submissions.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-[#8990a8]">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold text-[#dce1fb] text-lg mb-2">No submissions yet</p>
            <p className="text-sm mb-6">Start solving problems to build your portfolio</p>
            <Link href="/" className="btn-primary px-8 py-3 rounded-xl font-bold">
              Browse Problems
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {submissions.map((sub) => (
              <div
                key={`${sub.problemId}-${sub.submittedAt}`}
                className="glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-colors"
              >
                <div>
                  <Link
                    href={`/problems/${sub.problemId}`}
                    className="font-bold text-[#dce1fb] hover:text-[#00cbe6] transition-colors text-lg"
                  >
                    View Problem →
                  </Link>
                  <p className="text-sm text-[#8990a8] mt-1 font-medium">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-[#00cbe6]/15 border border-[#00cbe6]/30 rounded-xl px-5 py-2.5 font-bold text-[#00cbe6]">
                    Score: {sub.score ?? "—"}
                  </div>
                  {sub.githubUrl && (
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8990a8] hover:bg-white/10 hover:text-[#dce1fb] transition-all"
                    >
                      <GitBranch size={20} />
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
