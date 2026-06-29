import { NextResponse } from "next/server";
import { getDocClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await getDocClient().send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { problemId: id }
    }));

    if (!result.Item) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ problem: result.Item });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}
