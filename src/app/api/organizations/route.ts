import { NextResponse } from "next/server";
import { getDocClient } from "@/lib/dynamodb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";
import { maskEmail } from "@/lib/utils";

const TABLE_NAME = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  try {
    const result = await getDocClient().send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { orgId }
    }));

    if (!result.Item) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const org = result.Item;
    // Mask email for public responses
    const publicOrg = {
      ...org,
      contactEmail: maskEmail(org.contactEmail)
    };

    return NextResponse.json({ organization: publicOrg });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const orgId = uuidv4();
    const now = new Date().toISOString();

    const newOrg = {
      orgId,
      orgName: body.orgName,
      orgType: body.orgType,
      contactEmail: body.contactEmail,
      website: body.website,
      verified: false,
      postedProblemIds: [],
      logoUrl: body.logoUrl || "",
      joinedAt: now
    };

    await getDocClient().send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newOrg
    }));

    return NextResponse.json({ organization: newOrg }, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
