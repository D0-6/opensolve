import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";

// GET /api/notifications — fetch notifications for the logged-in user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await docClient.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false, // newest first
      Limit: 50,
    }));
    return NextResponse.json({ notifications: res.Items || [] });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ notifications: [] });
  }
}

// PATCH /api/notifications — mark one as read (scoped to the caller)
export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { createdAt } = body;
  if (!createdAt) return NextResponse.json({ error: "Missing createdAt" }, { status: 400 });

  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { userId, createdAt },
      UpdateExpression: "SET #r = :true",
      ExpressionAttributeNames: { "#r": "read" },
      ExpressionAttributeValues: { ":true": true },
    }));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mark read error:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
