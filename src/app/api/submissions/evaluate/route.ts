import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { sendEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";
import { getPostHogClient } from "@/lib/posthog-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const TABLE_NAME = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";
const NOTIFICATIONS_TABLE = process.env.DYNAMODB_TABLE_NOTIFICATIONS || "OpenSolve_Notifications";
const EVALUATIONS_TABLE = process.env.DYNAMODB_TABLE_EVALUATIONS || "OpenSolve_Evaluations";

const EvaluateSchema = z.object({
  problemId: z.string().min(1),
  rankKey: z.string().min(1),
  action: z.enum(['HIRE', 'CONTRACT', 'INTERVIEW', 'REJECT', 'INTERNSHIP', 'AWARD_PRIZE']),
  submitterName: z.string().min(1).optional().default('Student'),
  studentUserId: z.string().min(1).optional(),
  rubricScores: z.object({
    innovation: z.number().min(1).max(10),
    technical: z.number().min(1).max(10),
    design: z.number().min(1).max(10),
  }).optional()
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const orgAdmin = await currentUser();
  const orgId = orgAdmin?.publicMetadata?.orgId as string | undefined;

  try {
    const json = await request.json();
    const parsed = EvaluateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
    }
    const { problemId, rankKey, action, submitterName, studentUserId, rubricScores } = parsed.data;

    if (!studentUserId) {
      return NextResponse.json({ error: "studentUserId is required for evaluation" }, { status: 400 });
    }

    const problemRes = await docClient.send(new GetCommand({
      TableName: PROBLEMS_TABLE,
      Key: { problemId }
    }));

    const postedByOrgId = problemRes.Item?.postedByOrgId;
    const isOwner = postedByOrgId === userId || (orgId && postedByOrgId === orgId);

    if (!problemRes.Item || !isOwner) {
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
      notificationMessage = `The organization reviewing "${problemRes.Item.title}" has extended a full-time hiring offer to you.`;
      emailSubject = `🎊 Official Hiring Offer: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization was blown away by your submission. They would like to officially extend a full-time hiring offer!\n\nA representative will reach out to you shortly to discuss next steps and compensation.`;
    } else if (action === "CONTRACT") {
      status = "CONTRACT_OFFERED";
      notificationTitle = "📄 Contract Offer Extended";
      notificationMessage = `You have been selected for a paid contract on "${problemRes.Item.title}". Check your dashboard for details.`;
      emailSubject = `📄 Contract Offer: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nYour solution has been selected! The organization would like to offer you a paid contract to implement and maintain this solution.\n\nPlease check your dashboard for the contract details.`;
    } else if (action === "INTERNSHIP") {
      status = "INTERNSHIP_OFFERED";
      notificationTitle = "🚀 Internship Offer!";
      notificationMessage = `You have been selected for an internship opportunity based on your solution for "${problemRes.Item.title}".`;
      emailSubject = `🚀 Internship Offer: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization was very impressed by your submission and would like to offer you an internship role!\n\nA representative will be in touch shortly with more details.`;
    } else if (action === "AWARD_PRIZE") {
      status = "PRIZE_AWARDED";
      notificationTitle = "🏆 Prize Awarded!";
      notificationMessage = `Congratulations! You have been selected as a winner for "${problemRes.Item.title}".`;
      emailSubject = `🏆 Prize Awarded: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nCongratulations! Your solution for "${problemRes.Item.title}" has been selected as a winner and you have been awarded the prize.\n\nThe organization will reach out to process your reward.`;
    } else if (action === "INTERVIEW") {
      status = "INTERVIEW_REQUESTED";
      notificationTitle = "📅 Interview Request";
      notificationMessage = `The org reviewing "${problemRes.Item.title}" would like to schedule an interview with you to discuss your solution.`;
      emailSubject = `📅 Interview Request: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization loved your approach and would like to schedule an interview to discuss your code further.`;
    } else if (action === "REJECT") {
      status = "REJECTED";
      notificationTitle = "❌ Submission Rejected";
      notificationMessage = `The organization reviewing "${problemRes.Item.title}" has passed on your submission.`;
      emailSubject = `Update on your submission: ${problemRes.Item.title}`;
      emailBody = `Hello ${submitterName},\n\nThe organization has reviewed your submission but has decided to pass at this time.`;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Org Responsiveness check (Item 8)
    // If within 30 days of problem deadline, we increment the org's responsiveness score
    if (postedByOrgId) {
      const deadline = new Date(problemRes.Item.deadline);
      const thirtyDaysAfter = new Date(deadline.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (new Date() <= thirtyDaysAfter && new Date() >= deadline) {
        try {
          await docClient.send(new UpdateCommand({
            TableName: process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations",
            Key: { orgId: postedByOrgId },
            UpdateExpression: "ADD evaluationsMetDeadline :inc",
            ExpressionAttributeValues: { ":inc": 1 }
          }));
        } catch (e) {
          console.error("Failed to increment responsiveness metric for org", e);
        }
      }
    }

    // Update Submission Status
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { problemId, rankKey },
      UpdateExpression: "SET evaluationStatus = :status",
      ExpressionAttributeValues: { ":status": status }
    }));

    // removed manual SCORE logging as it is handled by the evaluator.ts engine

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

    // Send real email to the student via their Clerk account
    try {
      const clerk = await clerkClient();
      const student = await clerk.users.getUser(studentUserId);
      const studentEmail = student?.emailAddresses?.find(
        e => e.id === student.primaryEmailAddressId
      )?.emailAddress;
      if (studentEmail) {
        await sendEmail({ to: studentEmail, subject: emailSubject, body: emailBody });
      }
    } catch (err) {
      console.error("[CRITICAL] Failed to send evaluation email:", err);
      const ph = getPostHogClient();
      if (ph) {
        ph.capture({
          distinctId: userId,
          event: 'system_failure',
          properties: {
            type: 'email_delivery_failed',
            context: 'solution_evaluation',
            problemId
          }
        });
      }
    }

    // Server-Side Telemetry
    const ph = getPostHogClient();
    if (ph) {
      ph.capture({
        distinctId: userId, // Org user who performed the evaluation
        event: 'solution_evaluated',
        properties: {
          problemId,
          action,
          targetStudentId: studentUserId
        }
      });
      ph.flush();
    }

    return NextResponse.json({ success: true, status });

  } catch (error: unknown) {
    console.error("Error evaluating submission:", error);
    const msg = error instanceof Error ? error.message : "Failed to evaluate submission";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
