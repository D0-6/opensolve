import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getDocClient } from "@/lib/dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

const problemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150, "Title is too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(10000, "Description is too long"),
  source: z.string().optional().default("INDUSTRY"),
  prizeAmount: z.number().min(0).default(0),
  prizeType: z.string().optional().default("CASH"),
  deadline: z.string().datetime("Deadline must be a valid ISO datetime string"),
  domain: z.string().min(2, "Domain must be provided"),
  resourceLinks: z.array(z.string().url("Must be a valid URL")).max(10).optional().default([]),
  requiredSkills: z.array(z.string()).max(20).optional().default([]),
  allowedCountries: z.array(z.string()).max(50).optional().default([]),
  communityUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  judgingCriteria: z.string().max(2000).optional().or(z.literal(""))
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || undefined;
  const domain = searchParams.get("domain") || undefined;

  try {
    const { getProblems } = await import("@/lib/data");
    const result = await getProblems(source, domain);
    return NextResponse.json({ problems: result.items });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const orgId = user?.publicMetadata?.orgId as string | undefined;

  // Enforce strictly 'organization' role
  if (!user || role !== "organization") {
    return NextResponse.json({ error: "Sign in as an organization to post a challenge" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const validation = problemSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Invalid input data", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const body = validation.data;
    const problemId = uuidv4();
    const now = new Date().toISOString();

    const newProblem: Record<string, any> = {
      problemId,
      title: body.title,
      description: body.description,
      source: body.source,
      prizeAmount: body.prizeAmount,
      prizeType: body.prizeType,
      deadline: body.deadline,
      domain: body.domain,
      postedAt: now,
      postedByOrgId: orgId,
      verified: false,
      status: "OPEN",
      paymentStatus: body.prizeAmount > 0 ? "UNFUNDED" : "NA",
      isPaid: body.prizeAmount > 0 ? false : true,
      entityType: "PROBLEM",
      resourceLinks: body.resourceLinks,
      requiredSkills: body.requiredSkills,
      allowedCountries: body.allowedCountries,
      notificationSent: false,
    };

    if (body.sourceUrl) newProblem.sourceUrl = body.sourceUrl;
    if (body.communityUrl) newProblem.communityUrl = body.communityUrl;
    if (body.judgingCriteria) newProblem.judgingCriteria = body.judgingCriteria;
    if (Array.isArray(body.prizeBreakdown)) newProblem.prizeBreakdown = body.prizeBreakdown;

    await getDocClient().send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newProblem
    }));

    // Atomic stat increments
    const { incrementPlatformStat } = await import("@/lib/data");
    await Promise.all([
      incrementPlatformStat("activeProblems", 1),
      newProblem.prizeAmount > 0 ? incrementPlatformStat("totalPrizePool", newProblem.prizeAmount) : Promise.resolve(),
    ]);

    return NextResponse.json({ problem: newProblem }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create problem";
    console.error("Error creating problem:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
