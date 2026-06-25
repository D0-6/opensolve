import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_TEAMS || "OpenSolve_Teams";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: "Team Invite Code (teamId) is required" }, { status: 400 });
    }

    // Security Check 1: Is user already in a team?
    const existingTeam = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "contains(members, :userId)",
      ExpressionAttributeValues: { ":userId": userId }
    }));

    if (existingTeam.Items && existingTeam.Items.length > 0) {
      return NextResponse.json({ error: "You are already in a team. Leave your current team to join a new one." }, { status: 403 });
    }

    // Security Check 2: Does the target team exist?
    const teamRes = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { teamId }
    }));

    if (!teamRes.Item) {
      return NextResponse.json({ error: "Invalid invite code. Team not found." }, { status: 404 });
    }

    // Security Check 3: Is the team full? (Max 4)
    if (teamRes.Item.members.length >= 4) {
      return NextResponse.json({ error: "This team is already full (maximum 4 members)." }, { status: 403 });
    }

    // Pass: Update the team by appending the userId to the members list
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { teamId },
      UpdateExpression: "SET members = list_append(members, :newMember)",
      ExpressionAttributeValues: {
        ":newMember": [userId]
      }
    }));

    return NextResponse.json({ message: "Successfully joined the team!" }, { status: 200 });

  } catch (error: any) {
    console.error("Error joining team:", error);
    return NextResponse.json({ error: error.message || "Failed to join team" }, { status: 500 });
  }
}
