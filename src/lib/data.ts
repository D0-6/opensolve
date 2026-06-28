import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { Problem, Submission } from "@/types";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";
const EVALUATIONS_TABLE = process.env.DYNAMODB_TABLE_EVALUATIONS || "OpenSolve_Evaluations";

/**
 * getProblems — fetches challenges from DynamoDB.
 * 
 * Strategy:
 * 1. Try GSI-based queries for source/domain/status filtering.
 * 2. If the GSI doesn't exist or fails, fall back to a full ScanCommand
 *    with a FilterExpression to only return OPEN, non-metadata problems.
 *    This guarantees problems always appear even before GSIs are configured.
 */
export async function getProblems(source?: string, domain?: string, lastEvaluatedKey?: Record<string, unknown>): Promise<{ items: Problem[], lastEvaluatedKey?: Record<string, unknown> }> {
  // --- Attempt 1: Try GSI-based queries ---
  try {
    let command;
    if (source) {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "source-deadline-index",
        KeyConditionExpression: "#src = :src",
        FilterExpression: "#status = :open AND problemId <> :meta",
        ExpressionAttributeNames: { "#src": "source", "#status": "status" },
        ExpressionAttributeValues: { ":src": source, ":open": "OPEN", ":meta": "GLOBAL_METADATA" },
      });
    } else if (domain) {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "domain-deadline-index",
        KeyConditionExpression: "#dom = :dom",
        FilterExpression: "#status = :open AND problemId <> :meta",
        ExpressionAttributeNames: { "#dom": "domain", "#status": "status" },
        ExpressionAttributeValues: { ":dom": domain, ":open": "OPEN", ":meta": "GLOBAL_METADATA" },
      });
    } else {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "status-deadline-index",
        KeyConditionExpression: "#status = :status",
        FilterExpression: "problemId <> :meta",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "OPEN", ":meta": "GLOBAL_METADATA" },
      });
    }

    if (lastEvaluatedKey) {
      command.input.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await docClient.send(command);
    return {
      items: (result.Items || []) as Problem[],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (gsiError: unknown) {
    // --- Attempt 2: GSI failed (doesn't exist yet), fallback to Scan ---
    console.warn("GSI query failed, falling back to scan:", gsiError instanceof Error ? gsiError.message : "Unknown error");
    try {
      const scanInput: any = { // Keeping this simple for JS dynamism but localized
        TableName: PROBLEMS_TABLE,
        FilterExpression: "#status = :open AND problemId <> :meta",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":open": "OPEN", ":meta": "GLOBAL_METADATA" },
      };

      // Apply secondary filters on top of the scan
      if (source) {
        scanInput.FilterExpression += " AND #src = :src";
        scanInput.ExpressionAttributeNames["#src"] = "source";
        scanInput.ExpressionAttributeValues[":src"] = source;
      }
      if (domain) {
        scanInput.FilterExpression += " AND #dom = :dom";
        scanInput.ExpressionAttributeNames["#dom"] = "domain";
        scanInput.ExpressionAttributeValues[":dom"] = domain;
      }

      if (lastEvaluatedKey) {
        scanInput.ExclusiveStartKey = lastEvaluatedKey;
      }

      const scanResult = await docClient.send(new ScanCommand(scanInput));
      return {
        items: (scanResult.Items || []) as Problem[],
        lastEvaluatedKey: scanResult.LastEvaluatedKey,
      };
    } catch (scanError) {
      console.error("Both GSI and scan failed for getProblems:", scanError);
      return { items: [], lastEvaluatedKey: undefined };
    }
  }
}

export async function getProblem(id: string): Promise<Problem | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId: id }
    }));
    return (result.Item as Problem) || null;
  } catch (error) {
    console.error("Error fetching problem:", error);
    return null;
  }
}

export async function getSubmissions(problemId: string, lastEvaluatedKey?: Record<string, unknown>): Promise<{ items: Submission[], lastEvaluatedKey?: Record<string, unknown> }> {
  try {
    const input: { TableName: string; KeyConditionExpression: string; ExpressionAttributeValues: Record<string, unknown>; ExclusiveStartKey?: Record<string, unknown> } = {
      TableName: SUBMISSIONS_TABLE,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId },
    };
    if (lastEvaluatedKey) {
      input.ExclusiveStartKey = lastEvaluatedKey;
    }

    const command = new QueryCommand(input);
    const result = await docClient.send(command);
    return {
      items: (result.Items || []) as Submission[],
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { items: [], lastEvaluatedKey: undefined };
  }
}

export async function getEvaluations(problemId: string, rankKey: string): Promise<any[]> {
  try {
    const submissionKey = `${problemId}#${rankKey}`;
    const result = await docClient.send(new QueryCommand({
      TableName: EVALUATIONS_TABLE,
      KeyConditionExpression: "submissionKey = :sk",
      ExpressionAttributeValues: { ":sk": submissionKey }
    }));
    return result.Items || [];
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return [];
  }
}

/**
 * getUserSubmissions — fetch all submissions for a given userId.
 * 
 * Strategy:
 * 1. Try the GSI "userId-submittedAt-index" for O(1) lookup.
 * 2. If GSI doesn't exist on the live table (created before schema was finalized),
 *    fall back to a full scan with FilterExpression. Slower but always works.
 */
export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  // Attempt 1: GSI query
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: "userId-submittedAt-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false,
      Limit: 50,
    }));
    return (result.Items || []) as Submission[];
  } catch (gsiErr: unknown) {
    if (
      gsiErr instanceof Error &&
      (gsiErr.name === "ValidationException" ||
        gsiErr.message.includes("does not exist") ||
        gsiErr.message.includes("is not found"))
    ) {
      // Attempt 2: Fallback scan
      try {
        const scanResult = await docClient.send(new ScanCommand({
          TableName: SUBMISSIONS_TABLE,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
        }));
        // Sort descending by submittedAt since Scan returns unordered
        const sorted = (scanResult.Items || []).sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
        return sorted as Submission[];
      } catch (scanErr) {
        console.error("getUserSubmissions fallback scan failed:", scanErr);
        return [];
      }
    }
    console.error("getUserSubmissions GSI query failed:", gsiErr);
    return [];
  }
}

/**
 * incrementScoutPoints — add scouting points to a user's profile for finding a challenge.
 */
export async function incrementScoutPoints(scoutUserId: string, points: number = 100) {
  const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
  try {
    await docClient.send(new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: scoutUserId },
      UpdateExpression: "ADD scoutPoints :pts, scoutSubmissions :one",
      ExpressionAttributeValues: { ":pts": points, ":one": 1 },
    }));
  } catch (err) {
    console.error("[incrementScoutPoints] Failed:", err);
  }
}

export async function getOrganization(orgId: string) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: ORGS_TABLE,
      Key: { orgId }
    }));
    return result.Item || null;
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
}

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export interface PlatformStats {
  totalStudents: number;
  totalOrgs: number;
  totalSubmissions: number;
  activeProblems: number;
  totalPrizePool: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId: "GLOBAL_METADATA" }
    }));

    if (!result.Item) {
      return { totalStudents: 0, totalOrgs: 0, totalSubmissions: 0, activeProblems: 0, totalPrizePool: 0 };
    }

    return {
      totalStudents: result.Item.totalStudents || 0,
      totalOrgs: result.Item.totalOrgs || 0,
      totalSubmissions: result.Item.totalSubmissions || 0,
      activeProblems: result.Item.activeProblems || 0,
      totalPrizePool: result.Item.totalPrizePool || 0,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return { totalStudents: 0, totalOrgs: 0, totalSubmissions: 0, activeProblems: 0, totalPrizePool: 0 };
  }
}

export async function incrementPlatformStat(
  field: "totalStudents" | "totalOrgs" | "totalSubmissions" | "activeProblems" | "totalPrizePool",
  value: number = 1
) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId: "GLOBAL_METADATA" },
      UpdateExpression: "ADD #field :val",
      ExpressionAttributeNames: { "#field": field },
      ExpressionAttributeValues: { ":val": value },
    }));
  } catch (error) {
    console.error(`Error incrementing ${field}:`, error);
  }
}
