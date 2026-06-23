import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
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
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required" }, { status: 400 });
    }

    // In a real app, verify that the email matches the one associated with the user profile
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    });
    
    const userResult = await docClient.send(getCommand);
    if (!userResult.Item) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Generate a random token
    const token = uuidv4() + uuidv4();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Store the hash in DynamoDB
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: "SET profileEditTokenHash = :hash",
      ExpressionAttributeValues: {
        ":hash": tokenHash
      }
    });

    await docClient.send(updateCommand);

    // MOCK EMAIL SENDING
    const claimLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/profile/claim?token=${token}&userId=${userId}`;
    console.log(`\n=== MOCK EMAIL SENT ===\nTo: ${email}\nSubject: Claim your OpenSolve Profile\nLink: ${claimLink}\n=======================\n`);

    return NextResponse.json({ message: "Claim link sent to email." }, { status: 200 });
  } catch (error) {
    console.error("Error requesting claim link:", error);
    return NextResponse.json({ error: "Failed to request claim link" }, { status: 500 });
  }
}
