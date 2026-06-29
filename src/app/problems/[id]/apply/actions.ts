"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getDocClient } from "@/lib/dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";

const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function submitApplication(problemId: string, formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const motivation = formData.get("motivation") as string;
  const experience = formData.get("experience") as string;
  const timeline = formData.get("timeline") as string;

  const profileRes = await getDocClient().send(new GetCommand({
    TableName: PROFILES_TABLE,
    Key: { userId: user.id }
  }));
  
  const profile = profileRes.Item;
  if (!profile) throw new Error("Profile not complete. Please complete onboarding.");

  const problemRes = await getDocClient().send(new GetCommand({
    TableName: process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems",
    Key: { problemId }
  }));

  const problem = problemRes.Item;
  if (!problem) throw new Error("Problem not found.");
  if (problem.status !== "OPEN") throw new Error("This problem is no longer open for applications.");
  if (new Date(problem.deadline) < new Date()) throw new Error("The deadline for this problem has passed.");

  const applicationItem = {
    problemId,
    userId: user.id,
    studentName: profile.name,
    motivation,
    experience,
    timeline,
    status: "PENDING",
    appliedAt: new Date().toISOString(),
  };

  await getDocClient().send(
    new PutCommand({
      TableName: APPLICATIONS_TABLE,
      Item: applicationItem,
    })
  );

  // redirect to the team formation page
  redirect(`/problems/${problemId}/team`);
}
