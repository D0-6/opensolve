import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_QATHREADS || "OpenSolve_QAThreads";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { problemId } = await params;

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId },
    }));
    return NextResponse.json({ threads: result.Items });
  } catch (error) {
    console.error("Error fetching QA threads:", error);
    return NextResponse.json({ error: "Failed to fetch QA threads" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to ask a question" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { problemId } = await params;

  try {
    const body = await request.json();
    const questionId = uuidv4();
    const now = new Date().toISOString();
    const sk = `${now}#${questionId}`;

    const newThread = {
      problemId,
      sk,
      askedBy: userId,
      questionText: body.questionText.trim().substring(0, 1000),
      answers: [],
      upvotes: 0,
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newThread }));

    return NextResponse.json({ thread: newThread }, { status: 201 });
  } catch (error) {
    console.error("Error creating QA thread:", error);
    return NextResponse.json({ error: "Failed to create QA thread" }, { status: 500 });
  }
}
