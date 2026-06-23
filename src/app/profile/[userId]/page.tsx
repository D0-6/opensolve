import { docClient } from "@/lib/dynamodb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { notFound } from "next/navigation";
import { GitBranch, Trophy, Calendar } from "lucide-react";
import Link from "next/link";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export const dynamic = "force-dynamic";

export default async function UserProfile({ params }: { params: { userId: string } }) {
  const { userId } = params;

  // Mocking profile creation for the hackathon if it doesn't exist, to make demos easier
  let profile;
  try {
    const res = await docClient.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { userId } }));
    profile = res.Item;
  } catch (err) {
    console.error(err);
  }

  // Fetch submissions
  let submissions: any[] = [];
  try {
    const res = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: "userId-submittedAt-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId }
    }));
    submissions = res.Items || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      {/* Profile Header */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full flex-shrink-0 shadow-xl flex items-center justify-center text-white text-5xl font-bold">
          {profile?.name ? profile.name.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile?.name || `User ${userId}`}</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-xl">
            {profile?.bio || "A brilliant problem solver working on exciting challenges."}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-500" />
              {profile?.totalScore || 0} Total Score
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4 text-slate-500" />
              Joined {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "Recently"}
            </div>
            {profile?.githubUsername && (
              <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <GitBranch className="w-4 h-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
        
        {/* Hackathon note: Claim Profile button */}
        <div className="z-10 mt-4 md:mt-0">
           <Link href="/profile/claim" className="text-xs text-blue-600 dark:text-blue-400 underline decoration-blue-500/30 hover:decoration-blue-500 transition-colors">Claim & Edit Profile</Link>
        </div>
      </div>

      {/* Submissions History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Submission History</h2>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="glass-panel p-8 rounded-xl text-center text-slate-500">
              No submissions yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={`${sub.problemId}-${sub.submittedAt}`} className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-500/30 transition-colors">
                <div>
                  <Link href={`/problems/${sub.problemId}`} className="text-lg font-bold hover:text-blue-600 transition-colors">
                    View Problem
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Score</div>
                    <div className="font-bold text-lg text-emerald-600">{sub.score}</div>
                  </div>
                  <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <GitBranch className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
