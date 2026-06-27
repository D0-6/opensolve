"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";

const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function searchUsers(query: string) {
  if (!query || query.length < 3) return [];
  
  // Basic scan for demo purposes. In production, use GSI or ElasticSearch.
  const res = await docClient.send(new ScanCommand({
    TableName: PROFILES_TABLE,
    FilterExpression: "contains(#name, :q) OR contains(githubUsername, :q) OR contains(collegeOrInstitution, :q)",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":q": query }
  }));
  
  return (res.Items || []).map(p => ({
    userId: p.userId,
    name: p.name,
    country: p.country,
    githubUrl: p.githubUrl,
  }));
}

export async function addTeammate(problemId: string, teammateId: string, teammateName: string, currentMembers: any[]) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Exploit Patch 1: Prevent user from inviting themselves
  if (user.id === teammateId) {
    throw new Error("You cannot add yourself to the team.");
  }

  // Exploit Patch 2: Prevent duplicate members
  if (currentMembers.some(m => m.userId === teammateId)) {
    throw new Error("This user is already on your team.");
  }

  // Exploit Patch 3: Verify the user hasn't already submitted a solution to this problem independently
  const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
  const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
  const subRes = await docClient.send(new QueryCommand({
    TableName: SUBMISSIONS_TABLE,
    KeyConditionExpression: "problemId = :pid",
    ExpressionAttributeValues: { ":pid": problemId }
  }));
  
  if (subRes.Items && subRes.Items.some(sub => sub.userId === teammateId || (sub.teamMembers && sub.teamMembers.some((m: any) => m.userId === teammateId)))) {
    throw new Error("This user has already submitted a solution to this problem.");
  }

  // Add the teammate to the teamMembers array of the application
  await docClient.send(new UpdateCommand({
    TableName: APPLICATIONS_TABLE,
    Key: { problemId, userId: user.id },
    UpdateExpression: "SET teamMembers = list_append(if_not_exists(teamMembers, :emptyList), :newMember)",
    ExpressionAttributeValues: {
      ":emptyList": [],
      ":newMember": [{ userId: teammateId, name: teammateName }]
    }
  }));

  revalidatePath(`/problems/${problemId}/team`);
}

export async function removeTeammate(problemId: string, teammateId: string, currentMembers: any[]) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const newMembers = currentMembers.filter(m => m.userId !== teammateId);

  await docClient.send(new UpdateCommand({
    TableName: APPLICATIONS_TABLE,
    Key: { problemId, userId: user.id },
    UpdateExpression: "SET teamMembers = :newMembers",
    ExpressionAttributeValues: {
      ":newMembers": newMembers
    }
  }));

  revalidatePath(`/problems/${problemId}/team`);
}
