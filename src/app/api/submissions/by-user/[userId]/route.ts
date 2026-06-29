import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  const { userId: currentUserId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
    || (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  if (currentUserId !== userId && role !== "admin" && role !== "organization" && role !== "company") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-submittedAt-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    });

    const result = await docClient.send(command);
    return NextResponse.json({ submissions: result.Items });
  } catch (error) {
    console.error("Error fetching user submissions:", error);
    return NextResponse.json({ error: "Failed to fetch user submissions" }, { status: 500 });
  }
}
