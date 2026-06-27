import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

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

// POST /api/notifications — internal: create a notification for a user
export async function POST(request: Request) {
  // This endpoint is called from server-side evaluate logic — not exposed publicly
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { targetUserId, type, title, message, problemId } = body;

  if (!targetUserId || !type || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const notificationId = uuidv4();
  const now = new Date().toISOString();

  const item = {
    userId: targetUserId,
    createdAt: `${now}#${notificationId}`,
    notificationId,
    type,     // HIRED | CONTRACT_OFFERED | INTERVIEW_REQUESTED | MESSAGE | SYSTEM
    title,
    message,
    problemId: problemId || null,
    read: false,
  };

  await docClient.send(new PutCommand({ TableName: TABLE, Item: item }));
  return NextResponse.json({ notification: item }, { status: 201 });
}

// PATCH /api/notifications — mark all as read
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
