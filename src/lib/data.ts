import { getDocClient } from "@/lib/dynamodb";
import { QueryCommand, GetCommand, UpdateCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";

import { Problem, Submission } from "@/types";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";
const EVALUATIONS_TABLE = process.env.DYNAMODB_TABLE_EVALUATIONS || "OpenSolve_Evaluations";

/**
 * getProblems — fetches challenges from DynamoDB.
 * Throws on DB errors so API can return 500 instead of silent failure.
 */
export async function getProblems(source?: string, domain?: string, lastEvaluatedKey?: Record<string, unknown>): Promise<{ items: Problem[], lastEvaluatedKey?: Record<string, unknown> }> {
  let command;
  if (source) {
    command = new QueryCommand({
      TableName: PROBLEMS_TABLE,
      IndexName: "source-deadline-index",
      KeyConditionExpression: "#src = :src",
      FilterExpression: "#status = :open AND problemId <> :meta",
      ExpressionAttributeNames: { "#src": "source", "#status": "status" },
      ExpressionAttributeValues: { ":src": source, ":open": "OPEN", ":meta": "GLOBAL_METADATA" },
      Limit: 50
    });
  } else if (domain) {
    command = new QueryCommand({
      TableName: PROBLEMS_TABLE,
      IndexName: "domain-deadline-index",
      KeyConditionExpression: "#dom = :dom",
      FilterExpression: "#status = :open AND problemId <> :meta",
      ExpressionAttributeNames: { "#dom": "domain", "#status": "status" },
      ExpressionAttributeValues: { ":dom": domain, ":open": "OPEN", ":meta": "GLOBAL_METADATA" },
      Limit: 50
    });
  } else {
    command = new QueryCommand({
      TableName: PROBLEMS_TABLE,
      IndexName: "status-deadline-index",
      KeyConditionExpression: "#status = :status",
      FilterExpression: "problemId <> :meta",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "OPEN", ":meta": "GLOBAL_METADATA" },
      Limit: 50
    });
  }

  if (lastEvaluatedKey) {
    command.input.ExclusiveStartKey = lastEvaluatedKey;
  }

  const result = await getDocClient().send(command);
  return {
    items: (result.Items || []) as Problem[],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

export async function getProblem(id: string): Promise<Problem | null> {
  const result = await getDocClient().send(new GetCommand({
    TableName: PROBLEMS_TABLE,
    Key: { problemId: id },
    ConsistentRead: true
  }));
  return (result.Item as Problem) || null;
}

export async function getSubmissions(problemId: string, lastEvaluatedKey?: Record<string, unknown>): Promise<{ items: Submission[], lastEvaluatedKey?: Record<string, unknown> }> {
  const input: any = {
    TableName: SUBMISSIONS_TABLE,
    KeyConditionExpression: "problemId = :pid",
    ExpressionAttributeValues: { ":pid": problemId },
    Limit: 50
  };
  if (lastEvaluatedKey) {
    input.ExclusiveStartKey = lastEvaluatedKey;
  }

  const command = new QueryCommand(input);
  const result = await getDocClient().send(command);
  return {
    items: (result.Items || []) as Submission[],
    lastEvaluatedKey: result.LastEvaluatedKey
  };
}

export async function getEvaluations(problemId: string, rankKey: string): Promise<any[]> {
  const submissionKey = `${problemId}#${rankKey}`;
  const result = await getDocClient().send(new QueryCommand({
    TableName: EVALUATIONS_TABLE,
    KeyConditionExpression: "submissionKey = :sk",
    ExpressionAttributeValues: { ":sk": submissionKey },
    Limit: 50
  }));
  return result.Items || [];
}

export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  const result = await getDocClient().send(new QueryCommand({
    TableName: SUBMISSIONS_TABLE,
    IndexName: "userId-submittedAt-index",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
    ScanIndexForward: false,
    Limit: 50,
  }));
  return (result.Items || []) as Submission[];
}

export async function incrementScoutPoints(scoutUserId: string, points: number = 100) {
  if (points === undefined || isNaN(points)) {
    throw new Error("Invalid points value for incrementScoutPoints");
  }
  const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
  await getDocClient().send(new UpdateCommand({
    TableName: PROFILES_TABLE,
    Key: { userId: scoutUserId },
    UpdateExpression: "ADD scoutPoints :pts, scoutSubmissions :one",
    ExpressionAttributeValues: { ":pts": points, ":one": 1 },
  }));
}

export async function getOrganization(orgId: string) {
  const result = await getDocClient().send(new GetCommand({
    TableName: ORGS_TABLE,
    Key: { orgId },
    ConsistentRead: true
  }));
  return result.Item || null;
}

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export interface PlatformStats {
  totalStudents: number;
  totalOrgs: number;
  totalSubmissions: number;
  activeProblems: number;
  totalPrizePool: number;
}

const SHARD_COUNT = 10;

/**
 * getPlatformStats - Scatter-gather read from 10 shards to prevent hot partitions
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const keys = Array.from({ length: SHARD_COUNT }).map((_, i) => ({ problemId: `GLOBAL_METADATA#${i}` }));
  
  const result = await getDocClient().send(new BatchGetCommand({
    RequestItems: {
      [PROBLEMS_TABLE]: {
        Keys: keys,
        ConsistentRead: true
      }
    }
  }));

  const items = result.Responses?.[PROBLEMS_TABLE] || [];
  
  const stats: PlatformStats = {
    totalStudents: 0,
    totalOrgs: 0,
    totalSubmissions: 0,
    activeProblems: 0,
    totalPrizePool: 0,
  };

  for (const item of items) {
    stats.totalStudents += (item.totalStudents || 0);
    stats.totalOrgs += (item.totalOrgs || 0);
    stats.totalSubmissions += (item.totalSubmissions || 0);
    stats.activeProblems += (item.activeProblems || 0);
    stats.totalPrizePool += (item.totalPrizePool || 0);
  }

  return stats;
}

export async function incrementPlatformStat(
  field: "totalStudents" | "totalOrgs" | "totalSubmissions" | "activeProblems" | "totalPrizePool",
  value: number = 1
) {
  if (value === undefined || isNaN(value)) {
    throw new Error(`Invalid value for incrementPlatformStat field ${field}`);
  }

  const shardId = Math.floor(Math.random() * SHARD_COUNT);
  await getDocClient().send(new UpdateCommand({
    TableName: PROBLEMS_TABLE,
    Key: { problemId: `GLOBAL_METADATA#${shardId}` },
    UpdateExpression: "ADD #field :val",
    ExpressionAttributeNames: { "#field": field },
    ExpressionAttributeValues: { ":val": value },
  }));
}
