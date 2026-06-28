import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

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

  // Accept both 'organization' and 'company' roles for backwards compatibility
  if (!user || (role !== "organization" && role !== "company")) {
    return NextResponse.json({ error: "Sign in as an organization to post a challenge" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const problemId = uuidv4();
    const now = new Date().toISOString();

    const newProblem: Record<string, any> = {
      problemId,
      title: body.title,
      description: body.description,
      source: body.source || "INDUSTRY",
      prizeAmount: Number(body.prizeAmount) || 0,
      prizeType: body.prizeType || "CASH",
      deadline: body.deadline,
      domain: body.domain,
      postedAt: now,
      postedByOrgId: orgId || user.id, // orgId from metadata, fallback to userId
      verified: false,
      status: "OPEN",
      resourceLinks: body.resourceLinks || [],
      requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : [],
      allowedCountries: Array.isArray(body.allowedCountries) ? body.allowedCountries : [],
      maxTeamSize: typeof body.maxTeamSize === "number" ? body.maxTeamSize : 4,
      notificationSent: false,
    };

    if (body.requirements) newProblem.requirements = body.requirements;
    if (body.sourceUrl) newProblem.sourceUrl = body.sourceUrl;

    await docClient.send(new PutCommand({
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
