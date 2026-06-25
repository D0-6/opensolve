import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMODB_TABLE_TEAMS || "OpenSolve_Teams";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const teamId = uuidv4();
    
    const newTeam = {
      teamId,
      name: body.name || "Unnamed Team",
      members: [userId], // Creator is the first member
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newTeam
    }));

    return NextResponse.json({ team: newTeam }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: error.message || "Failed to create team" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  try {
    if (teamId) {
      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { teamId }
      }));
      if (!result.Item) return NextResponse.json({ error: "Team not found" }, { status: 404 });
      return NextResponse.json({ team: result.Item });
    }

    // Find the team the user belongs to (for MVP we scan, in prod we'd use a GSI or index)
    const scanResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "contains(members, :userId)",
      ExpressionAttributeValues: { ":userId": userId }
    }));

    if (scanResult.Items && scanResult.Items.length > 0) {
      return NextResponse.json({ team: scanResult.Items[0] });
    }

    return NextResponse.json({ team: null }); // User is not in a team
  } catch (error: any) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch team" }, { status: 500 });
  }
}
