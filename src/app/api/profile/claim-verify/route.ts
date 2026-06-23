import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return NextResponse.json({ error: "userId and token are required" }, { status: 400 });
    }

    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    });
    
    const userResult = await docClient.send(getCommand);
    if (!userResult.Item) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const user = userResult.Item;
    if (!user.profileEditTokenHash) {
      return NextResponse.json({ error: "No pending claim request found" }, { status: 400 });
    }

    // Hash the incoming token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Compare hashes
    if (tokenHash !== user.profileEditTokenHash) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Token is valid. Clear the token hash so it can't be reused.
    // In a real app, we would issue a JWT session cookie here.
    // For this hackathon scope, we return a success signal.
    
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: "REMOVE profileEditTokenHash",
    });

    await docClient.send(updateCommand);

    return NextResponse.json({ message: "Claim verified successfully", userId }, { status: 200 });
  } catch (error) {
    console.error("Error verifying claim link:", error);
    return NextResponse.json({ error: "Failed to verify claim link" }, { status: 500 });
  }
}
