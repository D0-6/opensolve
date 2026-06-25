import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

function formatRankKey(score: number, submittedAt: string, userId: string) {
  const inverseScore = (1000000 - score).toString().padStart(7, "0");
  return `${inverseScore}#${submittedAt}#${userId}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get("problemId");

  if (!problemId) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId },
    }));
    return NextResponse.json({ submissions: result.Items });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Auth check — userId comes from Clerk session, NOT from client body
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to submit a solution" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { problemId, studentName, githubUrl, demoUrl, writeup } = body;

    if (!problemId || !githubUrl || !writeup) {
      return NextResponse.json({ error: "Missing required fields: problemId, githubUrl, writeup" }, { status: 400 });
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    const match = githubUrl.match(githubRegex);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }
    const repoName = match[3];

    const submittedAt = new Date().toISOString();
    const score = 0;

    const newSubmission = {
      problemId,
      rankKey: formatRankKey(score, submittedAt, userId),
      studentName: studentName || "Anonymous",
      userId, // from Clerk auth — trusted server-side
      githubUrl,
      repoName,
      demoUrl: demoUrl || "",
      writeup: writeup.trim().substring(0, 500),
      upvotes: 0,
      submittedAt,
      score,
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newSubmission }));

    return NextResponse.json({ submission: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
