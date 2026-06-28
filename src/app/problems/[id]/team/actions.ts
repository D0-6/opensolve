"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";
import { TeamMember } from "@/types";

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

export async function addTeammate(problemId: string, teammateId: string, teammateName: string, currentMembers: TeamMember[], maxTeamSize: number) {
  try {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    // Exploit Patch 1: Prevent user from inviting themselves
    if (user.id === teammateId) {
      return { error: "You cannot add yourself to the team." };
    }

    // Exploit Patch 2: Prevent duplicate members
    if (currentMembers.some(m => m.userId === teammateId)) {
      return { error: "This user is already on your team." };
    }

    // Exploit Patch 3: Verify the user hasn't already submitted a solution to this problem independently
    const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
    const { QueryCommand } = await import("@aws-sdk/lib-dynamodb");
    const subRes = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId }
    }));
    
    if (subRes.Items && subRes.Items.some(sub => sub.userId === teammateId || (sub.teamMembers && sub.teamMembers.some((m: TeamMember) => m.userId === teammateId)))) {
      return { error: "This user has already submitted a solution to this problem." };
    }

    // Add the teammate to the teamMembers array of the application, ensuring it does not exceed maxTeamSize atomically.
    // The maxTeamSize check must account for the creator (+1)
    await docClient.send(new UpdateCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { problemId, userId: user.id },
      UpdateExpression: "SET teamMembers = list_append(if_not_exists(teamMembers, :emptyList), :newMember)",
      ConditionExpression: "attribute_not_exists(teamMembers) OR size(teamMembers) < :maxAllowed",
      ExpressionAttributeValues: {
        ":emptyList": [],
        ":newMember": [{ userId: teammateId, name: teammateName }],
        ":maxAllowed": Math.max(0, maxTeamSize - 1)
      }
    }));

    revalidatePath(`/problems/${problemId}/team`);
    return { success: true };
  } catch (err: unknown) {
    console.error("Add teammate error:", err);
    if (err instanceof Error && (err.name === "ConditionalCheckFailedException" || (err as any).name === "TransactionCanceledException")) {
      return { error: "Team is already full." };
    }
    return { error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

export async function removeTeammate(problemId: string, teammateId: string, currentMembers: TeamMember[]) {
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
