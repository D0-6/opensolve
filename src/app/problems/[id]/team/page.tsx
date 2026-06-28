import { currentUser } from "@clerk/nextjs/server";
import { getProblem } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TeamFormationClient from "./TeamFormationClient";

export const dynamic = "force-dynamic";

const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";

export default async function TeamFormationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    redirect(`/sign-in?redirect_url=/problems/${id}/team`);
  }

  const problem = await getProblem(id);
  if (!problem) notFound();

  // Verify they have an application. If not, bounce them back to apply
  let application = null;
  try {
    const res = await docClient.send(new GetCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { problemId: id, userId: user.id }
    }));
    application = res.Item;
  } catch (err) {
    console.error(err);
  }

  if (!application) {
    redirect(`/problems/${id}/apply`);
  }

  const maxTeamSize = typeof (problem as any).maxTeamSize === "number" ? (problem as any).maxTeamSize : 4;
  const currentMembers = Array.isArray(application.teamMembers) ? application.teamMembers : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        <Link href={`/problems/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Problem
        </Link>

        <h1 className="text-3xl font-medium text-zinc-900 mb-2 tracking-tight">Form Your Team</h1>
        <p className="text-zinc-500 mb-8 max-w-2xl">
          You have successfully applied to work on <strong className="text-zinc-800">{problem.title}</strong>. 
          You can now optionally invite other registered builders to join your team before you submit the final solution.
        </p>

        <TeamFormationClient 
          problemId={id} 
          maxTeamSize={maxTeamSize} 
          currentMembers={currentMembers} 
        />

      </div>
    </div>
  );
}
