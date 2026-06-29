import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const MESSAGES_TABLE = process.env.DYNAMODB_TABLE_MESSAGES || "OpenSolve_Messages";
const NOTIFICATIONS_TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";

// GET /api/messages?threadId=problemId#studentId
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });

  // Verify the user is part of this thread (studentId is the second segment)
  const studentId = threadId.split("#")[1];
  const problemId = threadId.split("#")[0];

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
    || (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  // Allow if the user is the student OR if they are an org (they can view any thread for their problems)
  if (studentId !== userId) {
    if (role === "admin") {
      // Admins can read anything
    } else if (role === "organization" || role === "company") {
      const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
      const problemRes = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems",
        Key: { problemId }
      }));
      if (!problemRes.Item || problemRes.Item.postedByOrgId !== userId) {
        return NextResponse.json({ error: "Forbidden: You do not own this problem" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const res = await docClient.send(new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: "threadId = :tid",
      ExpressionAttributeValues: { ":tid": threadId },
      ScanIndexForward: true, // oldest first for chat UI
    }));
    return NextResponse.json({ messages: res.Items || [], threadId, problemId, studentId });
  } catch (err) {
    console.error("Messages GET error:", err);
    return NextResponse.json({ messages: [] });
  }
}

// POST /api/messages — send a message
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { threadId, text, senderName, recipientUserId } = body;

  if (!threadId || !text || !recipientUserId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const studentId = threadId.split("#")[1];
  const problemId = threadId.split("#")[0];

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
    || (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.role;

  if (studentId !== userId) {
    if (role === "admin") {
      // Admins can post
    } else if (role === "organization" || role === "company") {
      const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
      const problemRes = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems",
        Key: { problemId }
      }));
      if (!problemRes.Item || problemRes.Item.postedByOrgId !== userId) {
        return NextResponse.json({ error: "Forbidden: You do not own this problem" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const messageId = uuidv4();
  const now = new Date().toISOString();

  const message = {
    threadId,
    createdAt: `${now}#${messageId}`,
    messageId,
    senderId: userId,
    senderName: senderName || "Unknown",
    text: text.trim().substring(0, 2000),
  };

  await docClient.send(new PutCommand({ TableName: MESSAGES_TABLE, Item: message }));

  // Write a notification for the recipient
  const { createNotification } = await import("@/lib/notifications");
  await createNotification({
    targetUserId: recipientUserId,
    type: "MESSAGE",
    title: `New message from ${senderName || "OpenSolve"}`,
    message: text.substring(0, 120) + (text.length > 120 ? "…" : ""),
    threadId,
    problemId
  });

  return NextResponse.json({ message }, { status: 201 });
}
