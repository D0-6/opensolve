import { currentUser } from "@clerk/nextjs/server";
import { getProblem } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { getDocClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import SubmitClient from "./SubmitClient";

export const dynamic = "force-dynamic";

const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";

export default async function SubmitSolutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    redirect(`/sign-in?redirect_url=/problems/${id}/submit`);
  }

  const problem = await getProblem(id);
  if (!problem) notFound();

  // Verify they have an application. If not, bounce them to apply page
  let application = null;
  try {
    const res = await getDocClient().send(new GetCommand({
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

  const teamMembers = Array.isArray(application.teamMembers) ? application.teamMembers : [];

  return (
    <SubmitClient 
      problemId={id} 
      problemTitle={problem.title} 
      teamMembers={teamMembers} 
    />
  );
}
