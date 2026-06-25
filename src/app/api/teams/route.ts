import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
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
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { teamId }
    }));
    
    if (!result.Item) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    
    return NextResponse.json({ team: result.Item });
  } catch (error: any) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch team" }, { status: 500 });
  }
}
