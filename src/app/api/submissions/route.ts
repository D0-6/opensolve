import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSubmissions, incrementPlatformStat } from "@/lib/data";
import { getPostHogClient } from "@/lib/posthog-server";
import { z } from "zod";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

function formatRankKey(score: number, submittedAt: string, userId: string) {
  const inverseScore = (1000000 - score).toString().padStart(7, "0");
  return `${inverseScore}#${submittedAt}#${userId}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const problemId = searchParams.get("problemId");
  const lekStr = searchParams.get("lastEvaluatedKey");
  let lastEvaluatedKey = undefined;
  
  if (lekStr) {
    try {
      lastEvaluatedKey = JSON.parse(decodeURIComponent(lekStr));
    } catch(e) {}
  }

  if (!problemId) {
    return NextResponse.json({ error: "problemId is required" }, { status: 400 });
  }

  try {
    const result = await getSubmissions(problemId, lastEvaluatedKey);
    return NextResponse.json({ submissions: result.items, lastEvaluatedKey: result.lastEvaluatedKey });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

const SubmissionSchema = z.object({
  problemId: z.string().min(1),
  studentName: z.string().min(2).max(100).optional(),
  githubUrl: z.string().regex(/^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/, "Invalid GitHub repository URL"),
  demoUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()).max(10).optional().default([]),
  writeup: z.string().min(10).max(10000)
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to submit a solution" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const json = await request.json();
    const parsed = SubmissionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }
    const { problemId, studentName, githubUrl, demoUrl, videoUrl, techStack, writeup } = parsed.data;

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    const match = githubUrl.match(githubRegex);
    const repoName = match ? match[3] : "repository";

    // SECURITY PASS: Verify Team Ownership
    let validatedTeamMembers = null;
    const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
    
    // Always fetch their application to prove they went through the gating flow
    const { GetCommand } = await import("@aws-sdk/lib-dynamodb");
    const appRes = await docClient.send(new GetCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { problemId, userId }
    }));
    
    if (!appRes.Item) {
      return NextResponse.json({ error: "You must apply to this problem before submitting." }, { status: 403 });
    }
    
    if (appRes.Item.teamMembers && appRes.Item.teamMembers.length > 0) {
      validatedTeamMembers = appRes.Item.teamMembers;
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
      videoUrl: videoUrl || "",
      techStack: techStack || [],
      writeup: writeup.trim().substring(0, 500),
      upvotes: 0,
      submittedAt,
      score,
      entityType: "SUBMISSION",
      teamMembers: validatedTeamMembers,
      evaluationStatus: "PENDING", // PENDING, CONTRACT_OFFERED, HIRED, REJECTED, PRIZE_AWARDED
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newSubmission }));
    
    // Trigger Atomic Increment!
    await incrementPlatformStat("totalSubmissions", 1);

    // PHASE 10: Send real confirmation emails via Clerk lookup
    const { sendEmail } = await import("@/lib/email");
    try {
      const clerk = await clerkClient();
      const studentUser = await clerk.users.getUser(userId);
      const studentEmail = studentUser?.emailAddresses?.find(
        e => e.id === studentUser.primaryEmailAddressId
      )?.emailAddress;
      if (studentEmail) {
        await sendEmail({
          to: studentEmail,
          subject: `Submission Received: ${repoName}`,
          body: `Congratulations! Your solution for the challenge has been successfully received.\n\nThe organization will review your code and demo. If you are selected, they will trigger a Hiring Offer or Contract through your dashboard.`
        });
      }
    } catch (emailErr) {
      console.error("[CRITICAL] Failed to send submission confirmation email:", emailErr);
      const ph = getPostHogClient();
      if (ph) {
        ph.capture({
          distinctId: userId,
          event: 'system_failure',
          properties: {
            type: 'email_delivery_failed',
            context: 'submission_confirmation',
            problemId
          }
        });
      }
    }

    // Server-Side Telemetry
    const ph = getPostHogClient();
    if (ph) {
      ph.capture({
        distinctId: userId,
        event: 'solution_submitted',
        properties: {
          problemId,
          score,
          hasDemo: !!demoUrl
        }
      });
      ph.flush();
    }

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
