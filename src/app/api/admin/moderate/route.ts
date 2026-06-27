import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strict RBAC check at the API level (even though middleware blocks it)
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
    || (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden - Admins only" }, { status: 403 });
  }

  try {
    const { problemId, action } = await request.json();

    if (!problemId || !action) {
      return NextResponse.json({ error: "Missing problemId or action" }, { status: 400 });
    }

    if (action === "APPROVE") {
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { problemId },
        UpdateExpression: "SET verified = :verified, #status = :status",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":verified": true,
          ":status": "OPEN" // Make sure it's active
        }
      }));
    } else if (action === "REJECT") {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { problemId }
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
