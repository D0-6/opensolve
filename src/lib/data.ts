import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export interface Problem {
  problemId: string;
  title: string;
  description?: string;
  requirements?: string;
  source: string;
  sourceUrl?: string;
  prizeAmount: number;
  prizeType?: string;
  deadline: string;
  domain: string;
  postedAt: string;
  postedByOrgId: string;
  verified: boolean;
  status: string;
  resourceLinks?: string[];
  requiredSkills?: string[];
  allowedCountries?: string[];
  maxTeamSize?: number;
  [key: string]: unknown;
}

export interface Submission {
  problemId: string;
  rankKey: string;
  userId: string;
  teamId?: string;
  studentName: string;
  githubUrl: string;
  demoUrl?: string;
  writeup: string;
  score: number;
  evaluationStatus?: string;
  status?: string;
  submittedAt: string;
  [key: string]: unknown;
}

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

export async function getProblems(source?: string, domain?: string, lastEvaluatedKey?: Record<string, any>) {
  try {
    let command;
    if (source) {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "source-deadline-index",
        KeyConditionExpression: "#src = :src",
        ExpressionAttributeNames: { "#src": "source" },
        ExpressionAttributeValues: { ":src": source },
      });
    } else if (domain) {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "domain-deadline-index",
        KeyConditionExpression: "#dom = :dom",
        ExpressionAttributeNames: { "#dom": "domain" },
        ExpressionAttributeValues: { ":dom": domain },
      });
    } else {
      command = new QueryCommand({
        TableName: PROBLEMS_TABLE,
        IndexName: "status-deadline-index",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "OPEN" },
      });
    }

    if (lastEvaluatedKey) {
      command.input.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    const result = await docClient.send(command);
    return {
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error("Error fetching problems:", error);
    return { items: [], lastEvaluatedKey: undefined };
  }
}

export async function getProblem(id: string) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId: id }
    }));
    return result.Item || null;
  } catch (error) {
    console.error("Error fetching problem:", error);
    return null;
  }
}

export async function getSubmissions(problemId: string, lastEvaluatedKey?: Record<string, any>) {
  try {
    const input: any = {
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
      items: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey
    };
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return { items: [], lastEvaluatedKey: undefined };
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
