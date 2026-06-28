import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { incrementPlatformStat, incrementScoutPoints } from "@/lib/data";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

const scoutSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150, "Title is too long"),
  domain: z.string().min(2, "Domain must be provided"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description is too long"),
  requirements: z.string().max(2000).optional().or(z.literal("")),
  sourceUrl: z.string().url("Must be a valid URL"),
  prizeAmount: z.number().min(0).default(0),
  prizeType: z.string().optional().default("CASH"),
  deadline: z.string().datetime("Deadline must be a valid ISO datetime string"),
  maxTeamSize: z.number().min(1).max(20).optional().default(4),
});

/**
 * POST /api/challenges/scout
 * 
 * Allows any authenticated user (students included) to submit a challenge
 * they discovered externally. The challenge is stored with:
 *   - source = "COMMUNITY"
 *   - status = "PENDING_REVIEW" (admin must approve before it goes OPEN)
 *   - scoutId, scoutName — the submitting user's profile reference
 *   - scoutBountyPercent = 5 — finder's fee percentage
 * 
 * On submission, the scout immediately earns 100 Scout Points on their profile.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to scout challenges." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const validation = scoutSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid input data", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const body = validation.data;
    const { title, domain, description, requirements, sourceUrl, prizeAmount, prizeType, deadline, maxTeamSize } = body;

    // Get scout's display name
    const scoutUser = await currentUser();
    const scoutName = scoutUser?.fullName || scoutUser?.firstName || "Anonymous Scout";

    const problemId = uuidv4();
    const now = new Date().toISOString();

    const problem = {
      problemId,
      title: title.trim().substring(0, 200),
      description: description.trim().substring(0, 5000),
      requirements: requirements?.trim()?.substring(0, 2000) || null,
      source: "COMMUNITY", // Community Scouts category
      sourceUrl: sourceUrl.trim(),
      prizeAmount: Number(prizeAmount) || 0,
      prizeType: prizeType || "CASH",
      deadline,
      domain: domain.trim(),
      postedAt: now,
      postedByOrgId: userId, // scout is the poster for filtering purposes
      verified: false,
      status: "PENDING_REVIEW", // requires admin approval before going OPEN
      resourceLinks: [],
      requiredSkills: [],
      allowedCountries: [],
      maxTeamSize: typeof maxTeamSize === "number" ? maxTeamSize : 4,
      notificationSent: false,
      // Scout / Finder's Fee fields
      entityType: "PROBLEM",
      scoutId: userId,
      scoutName,
      scoutBountyPercent: 5, // 5% of prize money goes to the scout
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: problem }));

    // Immediately reward the scout with 100 Scout Points
    await incrementScoutPoints(userId, 100);

    return NextResponse.json({ problem, scoutPoints: 100 }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit challenge";
    console.error("Scout challenge submission error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
