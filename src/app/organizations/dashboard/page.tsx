import { auth, currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import { Briefcase, Users, FileText, ExternalLink, Mail, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";
import EvaluationActions from "./EvaluationActions";
import FundButton from "./FundButton";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export default async function OrgDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  if (role !== "organization" && role !== "company" && role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch problems posted by this org (Using a GSI would be better in prod, but for MVP/demo we scan or query if GSI exists)
  // Let's assume we fetch all problems and filter for now to guarantee it works without complex GSI setup
  const problemsRes = await docClient.send(new QueryCommand({
    TableName: PROBLEMS_TABLE,
    IndexName: "status-deadline-index",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":status": "OPEN" },
  }));

  const orgProblems = (problemsRes.Items || []).filter(p => p.postedByOrgId === userId);

  // For each problem, fetch its submissions
  const dashboardData = await Promise.all(orgProblems.map(async (problem) => {
    const subsRes = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problem.problemId }
    }));
    return {
      ...problem,
      submissions: subsRes.Items || []
    };
  }));

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-24 px-6 w-full">
      <div className="w-full max-w-[125rem] mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl tracking-tight text-white font-medium">Hiring Pipeline</h1>
            <p className="text-zinc-400 text-base mt-2">Manage active challenges, evaluate team submissions, and extend offers.</p>
          </div>
          <Link href="/organizations/new" className="btn-primary px-6 py-3 font-medium shrink-0">
            Post New Challenge
          </Link>
        </div>

        {dashboardData.length === 0 ? (
          <div className="border border-white/10 border-dashed p-16 text-center bg-transparent/5">
            <Briefcase size={32} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-lg font-medium text-white mb-1">No active challenges</h2>
            <p className="text-zinc-400 text-sm">Post a challenge to start receiving submissions from top talent.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {dashboardData.map(problem => (
              <div key={problem.problemId} className="border border-white/10 bg-transparent">
                {/* Challenge Header */}
                <div className="bg-transparent/5 border-b border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{problem.title}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Users size={14}/> {problem.submissions.length} Submissions</span>
                      <span className="flex items-center gap-1.5"><Award size={14}/> {problem.prizeType?.replace("_", " ")}</span>
                    </div>
                  </div>
                  <Link href={`/problems/${problem.problemId}`} className="text-zinc-400 text-sm font-medium hover:text-blue-400 transition-colors whitespace-nowrap">
                    View Public Page &rarr;
                  </Link>
                </div>

                {/* Submissions Pipeline */}
                <div className="p-6">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Candidate Pipeline</h3>
                  
                  {problem.prizeAmount > 0 && !problem.isPaid ? (
                    <div className="py-12 px-6 border border-white/10 bg-transparent/5 flex flex-col items-center justify-center text-center space-y-4 rounded-sm">
                      <div className="w-12 h-12 bg-transparent border border-white/10 rounded-full flex items-center justify-center text-zinc-400 mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                      <h4 className="text-lg font-semibold text-white">Submissions Locked</h4>
                      <p className="text-zinc-400 max-w-md text-sm">
                        You have {problem.submissions.length} submission{problem.submissions.length === 1 ? "" : "s"} waiting. Pay the prize amount to unlock candidate code, writeups, and evaluations. Payment is due 5 days before the deadline.
                      </p>
                      <div className="pt-4">
                        <FundButton problemId={problem.problemId} />
                      </div>
                    </div>
                  ) : problem.submissions.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-sm italic">
                      Awaiting submissions...
                    </div>
                  ) : (
                    <div className="flex flex-col border-t border-white/10">
                      {problem.submissions.map((sub: any) => (
                        <div key={sub.rankKey} className="border-b border-white/10 py-6 px-4 -mx-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-transparent/5 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg text-white truncate">{sub.studentName}</h4>
                              {sub.teamId && <span className="text-[10px] bg-zinc-200 text-zinc-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Team</span>}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-transparent/10 border border-white/20 text-zinc-400 font-bold uppercase tracking-widest">{sub.evaluationStatus || "PENDING"}</span>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{sub.writeup}</p>
                            <div className="flex items-center gap-6 text-sm font-medium">
                              <a href={sub.githubUrl} target="_blank" className="text-zinc-400 flex items-center gap-1.5 hover:text-blue-400 transition-colors"><FileText size={16}/> View Code</a>
                              {sub.demoUrl && <a href={sub.demoUrl} target="_blank" className="text-zinc-400 flex items-center gap-1.5 hover:text-blue-400 transition-colors"><ExternalLink size={16}/> Live Demo</a>}
                            </div>
                          </div>

                          <EvaluationActions 
                            problemId={problem.problemId} 
                            rankKey={sub.rankKey} 
                            prizeType={problem.prizeType} 
                            submitterName={sub.studentName} 
                            studentUserId={sub.userId} 
                          />
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
