import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { sendEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const NOTIFICATIONS_TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { problemId, rankKey, action, submitterName, studentUserId } = await request.json();

    if (!problemId || !rankKey || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Security Check: only the org that posted the problem can evaluate
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
    let notificationTitle = "";
    let notificationMessage = "";

    if (action === "HIRE") {
      status = "HIRED";
      notificationTitle = "🎉 Hiring Offer Received!";
      notificationMessage = `The organization reviewing "${problemRes.Item.title}" has extended a full-time hiring offer to you. A representative will contact you shortly.`;
      emailSubject = `🎊 Official Hiring Offer: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization was blown away by your submission. They would like to officially extend a full-time hiring offer!\n\nA representative will reach out to you shortly to discuss next steps and compensation.`;
    } else if (action === "CONTRACT") {
      status = "CONTRACT_OFFERED";
      notificationTitle = "📄 Contract Offer Extended";
      notificationMessage = `You have been selected for a paid contract on "${problemRes.Item.title}". Check your dashboard for details.`;
      emailSubject = `📄 Contract Offer: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nYour solution has been selected! The organization would like to offer you a paid contract to implement and maintain this solution.\n\nPlease check your dashboard for the contract details.`;
    } else if (action === "INTERVIEW") {
      status = "INTERVIEW_REQUESTED";
      notificationTitle = "📅 Interview Request";
      notificationMessage = `The org reviewing "${problemRes.Item.title}" would like to schedule an interview with you to discuss your solution.`;
      emailSubject = `📅 Interview Request: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization loved your approach and would like to schedule an interview to discuss your code further.`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update Submission Status
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { problemId, rankKey },
      UpdateExpression: "SET evaluationStatus = :status",
      ExpressionAttributeValues: { ":status": status }
    }));

    // Write in-app notification for the student
    const notificationId = uuidv4();
    const now = new Date().toISOString();
    await docClient.send(new PutCommand({
      TableName: NOTIFICATIONS_TABLE,
      Item: {
        userId: studentUserId,
        createdAt: `${now}#${notificationId}`,
        notificationId,
        type: action,
        title: notificationTitle,
        message: notificationMessage,
        problemId,
        read: false,
      }
    }));

    // Send email
    await sendEmail({
      to: `student-${studentUserId}@opensolve.user`,
      subject: emailSubject,
      body: emailBody
    });

    return NextResponse.json({ success: true, status });

  } catch (error: unknown) {
    console.error("Error evaluating submission:", error);
    const msg = error instanceof Error ? error.message : "Failed to evaluate submission";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
