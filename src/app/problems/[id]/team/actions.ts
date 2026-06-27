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

export async function addTeammate(problemId: string, teammateId: string, teammateName: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

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
