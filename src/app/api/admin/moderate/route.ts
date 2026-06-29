import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Standardized RBAC check using Clerk's publicMetadata
  const role = (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
  }

  try {
    const { problemId, action } = await request.json();

    if (!problemId || !action) {
      return NextResponse.json({ error: "Missing problemId or action" }, { status: 400 });
    }

    // Fetch the problem first to check its current status and get scout data
    const problemRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { problemId },
      ConsistentRead: true
    }));

    const problem = problemRes.Item;
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      if (problem.status === "OPEN") {
        return NextResponse.json({ error: "Problem is already open" }, { status: 400 });
      }

      const transactItems: any[] = [];

      // 1. Approve the problem
      transactItems.push({
        Update: {
          TableName: TABLE_NAME,
          Key: { problemId },
          UpdateExpression: "SET verified = :verified, #status = :status",
          ConditionExpression: "attribute_exists(problemId)",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":verified": true, ":status": "OPEN" }
        }
      });

      // 2. Award scout points if this was scouted
      if (problem.scoutId) {
        transactItems.push({
          Update: {
            TableName: PROFILES_TABLE,
            Key: { userId: problem.scoutId },
            UpdateExpression: "ADD scoutPoints :pts, scoutSubmissions :one",
            ExpressionAttributeValues: { ":pts": 100, ":one": 1 }
          }
        });
      }

      // 3 & 4. Increment Platform Stats
      const shardId = Math.floor(Math.random() * 10);
      if (problem.prizeAmount > 0) {
        transactItems.push({
          Update: {
            TableName: TABLE_NAME,
            Key: { problemId: `GLOBAL_METADATA#${shardId}` },
            UpdateExpression: "ADD activeProblems :val, totalPrizePool :prize",
            ExpressionAttributeValues: { ":val": 1, ":prize": problem.prizeAmount }
          }
        });
      } else {
        transactItems.push({
          Update: {
            TableName: TABLE_NAME,
            Key: { problemId: `GLOBAL_METADATA#${shardId}` },
            UpdateExpression: "ADD activeProblems :val",
            ExpressionAttributeValues: { ":val": 1 }
          }
        });
      }

      await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));

    } else if (action === "REJECT") {
      // Soft-delete to preserve audit trail
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { problemId },
        UpdateExpression: "SET #status = :status",
        ConditionExpression: "attribute_exists(problemId)",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "REJECTED" }
      }));
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in moderation API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
