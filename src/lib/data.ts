import { docClient } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const ORGS_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

export async function getProblems(source?: string, domain?: string) {
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
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
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

export async function getSubmissions(problemId: string) {
  try {
    const command = new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId },
    });
    const result = await docClient.send(command);
    return result.Items || [];
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
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
