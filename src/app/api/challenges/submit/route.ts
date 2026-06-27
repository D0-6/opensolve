import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function POST(request: Request) {
  const user = await currentUser();
  
  // Both students and organizations can act as scouts and submit community links.
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a challenge link" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.sourceUrl || !body.title || !body.domain || !body.deadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // XSS & Security Validation
    try {
      const url = new URL(body.sourceUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return NextResponse.json({ error: "Invalid URL protocol. Only HTTP/HTTPS is allowed." }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

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
      status: "OPEN",
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

    return NextResponse.json({ success: true, problemId });
  } catch (error) {
    console.error("Error submitting crowdsourced problem:", error);
    return NextResponse.json({ error: "Failed to submit challenge link" }, { status: 500 });
  }
}
