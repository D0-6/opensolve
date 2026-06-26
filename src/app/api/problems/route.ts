import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const domain = searchParams.get("domain");

  try {
    let command;
    
    if (source) {
      // Query by GSI1: source-deadline-index
      command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "source-deadline-index",
        KeyConditionExpression: "#src = :src",
        ExpressionAttributeNames: { "#src": "source" },
        ExpressionAttributeValues: { ":src": source },
      });
    } else if (domain) {
      // Query by GSI2: domain-deadline-index
      command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "domain-deadline-index",
        KeyConditionExpression: "#dom = :dom",
        ExpressionAttributeNames: { "#dom": "domain" },
        ExpressionAttributeValues: { ":dom": domain },
      });
    } else {
      // Query by GSI3: status-deadline-index natively sorts by deadline
      command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "status-deadline-index",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "OPEN" },
      });
    }

    const result = await docClient.send(command);
    return NextResponse.json({ problems: result.Items });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "organization" || !user.publicMetadata?.orgId) {
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

    const newProblem = {
      problemId,
      title: body.title,
      description: body.description,
      source: body.source || "INDUSTRY",
      sourceUrl: body.sourceUrl || "",
      prizeAmount: Number(body.prizeAmount) || 0,
      prizeType: body.prizeType || "CASH",
      deadline: body.deadline,
      domain: body.domain,
      postedAt: now,
      postedByOrgId: user.publicMetadata.orgId, // pulled securely from clerk metadata
      verified: false,
      status: "OPEN",
      resourceLinks: body.resourceLinks || [],
      notificationSent: false,
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newProblem
    }));

    // PHASE 10: Trigger Automated Blast to Students
    const { sendMockEmail } = await import("@/lib/email");
    await sendMockEmail({
      to: "all-active-students@opensolve.talent",
      subject: `New Hiring Challenge: ${newProblem.title}`,
      body: `A new ${newProblem.prizeType} challenge has been posted by an organization in the ${newProblem.domain} domain.\n\nPrize/Budget: $${newProblem.prizeAmount}\nDeadline: ${new Date(newProblem.deadline).toLocaleDateString()}\n\nLog in to OpenSolve to assemble your team and start building!`
    });

    return NextResponse.json({ problem: newProblem }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating problem:", error);
    return NextResponse.json({ error: error.message || "Failed to create problem" }, { status: 500 });
  }
}
