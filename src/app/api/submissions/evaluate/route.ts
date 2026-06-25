import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { sendMockEmail } from "@/lib/email";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { problemId, rankKey, action, submitterName, studentUserId } = await request.json();

    if (!problemId || !rankKey || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security Check: Verify that the user executing this is the Organization that posted the problem
    const problemRes = await docClient.send(new GetCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId }
    }));

    if (!problemRes.Item || problemRes.Item.postedByOrgId !== userId) {
      return NextResponse.json({ error: "Forbidden: You do not own this problem." }, { status: 403 });
    }

    let status = "PENDING";
    let emailSubject = "";
    let emailBody = "";

    if (action === "HIRE") {
      status = "HIRED";
      emailSubject = `🎊 Official Hiring Offer from ${problemRes.Item.title}!`;
      emailBody = `Hello ${submitterName},\n\nThe organization was blown away by your submission. They would like to officially extend a full-time hiring offer!\n\nA representative will reach out to you shortly to discuss next steps and compensation.`;
    } else if (action === "CONTRACT") {
      status = "CONTRACT_OFFERED";
      emailSubject = `📄 Contract Offer Extended: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nYour solution has been selected! The organization would like to offer you a paid contract to implement and maintain this solution.\n\nPlease check your dashboard for the contract details.`;
    } else if (action === "INTERVIEW") {
      status = "INTERVIEW_REQUESTED";
      emailSubject = `📅 Interview Request: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization loved your approach and would like to schedule an interview with you to discuss your code further.`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update Submission Status in DynamoDB
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { problemId, rankKey },
      UpdateExpression: "SET evaluationStatus = :status",
      ExpressionAttributeValues: {
        ":status": status
      }
    }));

    // Trigger Mock Email
    await sendMockEmail({
      to: `student-${studentUserId}@opensolve.user`,
      subject: emailSubject,
      body: emailBody
    });

    return NextResponse.json({ success: true, status });

  } catch (error: any) {
    console.error("Error evaluating submission:", error);
    return NextResponse.json({ error: error.message || "Failed to evaluate submission" }, { status: 500 });
  }
}
