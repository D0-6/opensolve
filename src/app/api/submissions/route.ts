import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

// Helper for SK format: zero-padded inverse score (to allow descending sort)
// 1000000 - score ensures higher scores sort first
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
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "problemId = :pid",
      ExpressionAttributeValues: { ":pid": problemId },
    });

    const result = await docClient.send(command);
    return NextResponse.json({ submissions: result.Items });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { problemId, studentName, userId, githubUrl, demoUrl, writeup, honeypot } = body;

    // Honeypot validation
    if (honeypot) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    // Server-side validation
    if (!problemId || !userId || !githubUrl || !writeup) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    const match = githubUrl.match(githubRegex);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
    }
    const repoName = match[3];

    const submittedAt = new Date().toISOString();
    const score = 0;
    const upvotes = 0;

    // Sanitize writeup (basic trim and limit)
    const sanitizedWriteup = writeup.trim().substring(0, 500);

    const newSubmission = {
      problemId,
      rankKey: formatRankKey(score, submittedAt, userId),
      studentName,
      userId,
      githubUrl,
      repoName,
      demoUrl,
      writeup: sanitizedWriteup,
      upvotes,
      submittedAt,
      score
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newSubmission
    }));

    return NextResponse.json({ submission: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
