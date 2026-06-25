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
    <div className="min-h-screen bg-black pt-24 pb-16 px-6">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display-lg text-white font-bold">Hiring Pipeline</h1>
            <p className="text-zinc-400 font-body-md mt-2">Manage active challenges, evaluate team submissions, and extend offers.</p>
          </div>
          <Link href="/organizations/new" className="btn-primary px-6 py-3 rounded-xl font-bold">
            + Post New Challenge
          </Link>
        </div>

        {dashboardData.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <Briefcase size={48} className="mx-auto text-zinc-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No active challenges</h2>
            <p className="text-zinc-400 mb-6">Post a challenge to start receiving submissions from top talent.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {dashboardData.map(problem => (
              <div key={problem.problemId} className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Challenge Header */}
                <div className="bg-white/5 border-b border-white/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
                    <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                      <span className="flex items-center gap-1"><Users size={16}/> {problem.submissions.length} Submissions</span>
                      <span className="flex items-center gap-1"><Award size={16}/> {problem.prizeType}</span>
                    </div>
                  </div>
                  <Link href={`/problems/${problem.problemId}`} className="text-white text-sm font-bold hover:underline">View Public Page &rarr;</Link>
                </div>

                {/* Submissions Pipeline */}
                <div className="p-6 md:p-8 bg-black/50">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">Candidate Pipeline</h3>
                  
                  {problem.submissions.length === 0 ? (
                    <p className="text-zinc-500 italic">Awaiting submissions...</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {problem.submissions.map(sub => (
                        <div key={sub.rankKey} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/10 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-lg text-white">{sub.studentName} {sub.teamId && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full ml-2">Team Submission</span>}</h4>
                              <span className="text-xs px-2 py-1 rounded-md bg-white/10 text-zinc-400">{sub.evaluationStatus || "PENDING"}</span>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{sub.writeup}</p>
                            <div className="flex items-center gap-4 text-sm font-bold">
                              <a href={sub.githubUrl} target="_blank" className="text-white flex items-center gap-1 hover:text-zinc-300"><FileText size={16}/> View Code</a>
                              {sub.demoUrl && <a href={sub.demoUrl} target="_blank" className="text-white flex items-center gap-1 hover:text-zinc-300"><ExternalLink size={16}/> Live Demo</a>}
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
