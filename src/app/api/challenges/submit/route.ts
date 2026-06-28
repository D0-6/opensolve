import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog-server";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

const SubmitSchema = z.object({
  sourceUrl: z.string().url(),
  title: z.string().min(3).max(150),
  domain: z.string().min(2).max(50),
  deadline: z.string().datetime(),
  description: z.string().max(50000).optional().default(""),
  prizeAmount: z.coerce.number().min(0).default(0),
  prizeType: z.string().default("PRIZE_ONLY"),
  status: z.enum(['OPEN', 'DRAFT', 'PUBLISHED']).default('OPEN')
});

export async function POST(request: Request) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a challenge link" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const json = await request.json();
    const parsed = SubmitSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }

    const body = parsed.data;

    const problemId = uuidv4();
    const now = new Date().toISOString();

    const newProblem = {
      problemId,
      title: body.title,
      description: body.description || "",
      requirements: "",
      source: "COMMUNITY", // Marks it as a crowdsourced problem
      sourceUrl: body.sourceUrl,
      prizeAmount: Number(body.prizeAmount) || 0,
      prizeType: body.prizeType || "PRIZE_ONLY",
      deadline: body.deadline,
      domain: body.domain,
      postedAt: now,
      verified: false,
      status: body.status,
      entityType: "PROBLEM",
      scoutId: user.id, // Tie the discovery to the submitting user
      scoutName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Anonymous Scout",
      resourceLinks: [],
      requiredSkills: [],
      allowedCountries: [],
      maxTeamSize: 4, // default for community
      notificationSent: false,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newProblem
    }));

    // Server-Side Telemetry
    const ph = getPostHogClient();
    if (ph) {
      ph.capture({
        distinctId: user.id,
        event: 'challenge_submitted',
        properties: {
          problemId,
          domain: body.domain,
          prizeAmount: body.prizeAmount,
          source: 'COMMUNITY',
          $current_url: body.sourceUrl
        }
      });
      ph.flush(); // Ensure the event is sent before the serverless function spins down
    }

    return NextResponse.json({ success: true, problemId });
  } catch (error) {
    console.error("Error submitting crowdsourced problem:", error);
    return NextResponse.json({ error: "Failed to submit challenge link" }, { status: 500 });
  }
}
