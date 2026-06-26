import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import { Briefcase, Users, FileText, ExternalLink, Mail, CheckCircle2, Award } from "lucide-react";
import Link from "next/link";
import EvaluationActions from "./EvaluationActions";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export default async function OrgDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch problems posted by this org (Using a GSI would be better in prod, but for hackathon/demo we scan or query if GSI exists)
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
    <div className="min-h-screen bg-white pt-24 pb-24 px-6 w-full">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-zinc-200 pb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl tracking-tight text-zinc-900 font-medium">Hiring Pipeline</h1>
            <p className="text-zinc-500 text-base mt-2">Manage active challenges, evaluate team submissions, and extend offers.</p>
          </div>
          <Link href="/organizations/new" className="btn-primary px-6 py-3 font-medium shrink-0">
            Post New Challenge
          </Link>
        </div>

        {dashboardData.length === 0 ? (
          <div className="border border-zinc-200 border-dashed p-16 text-center bg-zinc-50">
            <Briefcase size={32} className="mx-auto text-zinc-300 mb-4" />
            <h2 className="text-lg font-medium text-zinc-900 mb-1">No active challenges</h2>
            <p className="text-zinc-500 text-sm">Post a challenge to start receiving submissions from top talent.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {dashboardData.map(problem => (
              <div key={problem.problemId} className="border border-zinc-200 bg-white">
                {/* Challenge Header */}
                <div className="bg-zinc-50 border-b border-zinc-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-900">{problem.title}</h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Users size={14}/> {problem.submissions.length} Submissions</span>
                      <span className="flex items-center gap-1.5"><Award size={14}/> {problem.prizeType?.replace("_", " ")}</span>
                    </div>
                  </div>
                  <Link href={`/problems/${problem.problemId}`} className="text-zinc-500 text-sm font-medium hover:text-[#b91c1c] transition-colors whitespace-nowrap">
                    View Public Page &rarr;
                  </Link>
                </div>

                {/* Submissions Pipeline */}
                <div className="p-6">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Candidate Pipeline</h3>
                  
                  {problem.submissions.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-sm italic">
                      Awaiting submissions...
                    </div>
                  ) : (
                    <div className="flex flex-col border-t border-zinc-200">
                      {problem.submissions.map(sub => (
                        <div key={sub.rankKey} className="border-b border-zinc-200 py-6 px-4 -mx-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-zinc-50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg text-zinc-900 truncate">{sub.studentName}</h4>
                              {sub.teamId && <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Team</span>}
                              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-600 font-bold uppercase tracking-widest">{sub.evaluationStatus || "PENDING"}</span>
                            </div>
                            <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{sub.writeup}</p>
                            <div className="flex items-center gap-6 text-sm font-medium">
                              <a href={sub.githubUrl} target="_blank" className="text-zinc-500 flex items-center gap-1.5 hover:text-[#b91c1c] transition-colors"><FileText size={16}/> View Code</a>
                              {sub.demoUrl && <a href={sub.demoUrl} target="_blank" className="text-zinc-500 flex items-center gap-1.5 hover:text-[#b91c1c] transition-colors"><ExternalLink size={16}/> Live Demo</a>}
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
