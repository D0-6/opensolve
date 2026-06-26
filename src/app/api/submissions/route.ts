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

    // SECURITY PASS: Verify Team Ownership
    let validatedTeamId = null;
    if (body.teamId) {
      const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
      const teamRes = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_TEAMS || "OpenSolve_Teams",
        Key: { teamId: body.teamId }
      }));
      
      if (!teamRes.Item) {
        return NextResponse.json({ error: "The specified team does not exist." }, { status: 400 });
      }
      
      if (!teamRes.Item.members.includes(userId)) {
        return NextResponse.json({ error: "Security Exception: You cannot submit on behalf of a team you are not a member of." }, { status: 403 });
      }
      
      validatedTeamId = body.teamId;
    }

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
      teamId: validatedTeamId,
      evaluationStatus: "PENDING", // PENDING, CONTRACT_OFFERED, HIRED, REJECTED, PRIZE_AWARDED
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newSubmission }));

    // PHASE 10: Trigger Email Receipts
    const { sendEmail } = await import("@/lib/email");
    
    // Alert the Student/Team
    await sendEmail({
      to: `student-${userId}@opensolve.user`,
      subject: `Submission Received: ${repoName}`,
      body: `Congratulations! Your solution for the challenge has been successfully verified and stored on the blockchain/database.\n\nThe organization will review your code and demo. If you are selected, they will trigger a Hiring Offer or Contract through your dashboard.`
    });

    // Alert the Organization
    await sendEmail({
      to: `org-admin@opensolve.company`,
      subject: `New Solution Submitted!`,
      body: `A new solution has just landed in your Hiring Pipeline dashboard.\n\nCandidate/Team ID: ${body.teamId || userId}\nGitHub: ${githubUrl}\n\nLog in to your Organization Dashboard to evaluate the code and extend an offer.`
    });

    // PHASE 11: Trigger Auto-Scoring Engine in the background
    const { evaluateSubmissionAsynchronously } = await import("@/lib/evaluator");
    // Do not await this. Let it run asynchronously!
    evaluateSubmissionAsynchronously({
      problemId,
      oldRankKey: newSubmission.rankKey,
      userId: newSubmission.userId,
      submittedAt: newSubmission.submittedAt,
      githubUrl: newSubmission.githubUrl,
      writeup: newSubmission.writeup
    });

    return NextResponse.json({ submission: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}
