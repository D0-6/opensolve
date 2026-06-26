import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_QATHREADS || "OpenSolve_QAThreads";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in to answer" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { problemId } = await params;

  try {
    const body = await request.json();
    const { sk, answerText } = body;

    if (!sk || !answerText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newAnswer = {
      answeredBy: userId,
      answerText: answerText.trim().substring(0, 1000),
      answeredAt: now
    };

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        problemId,
        sk
      },
      UpdateExpression: "SET answers = list_append(if_not_exists(answers, :empty_list), :new_answer)",
      ExpressionAttributeValues: {
        ":new_answer": [newAnswer],
        ":empty_list": []
      },
      ReturnValues: "ALL_NEW"
    });

    const result = await docClient.send(command);

    if (result.Attributes && result.Attributes.askedBy) {
      const { sendEmail } = await import("@/lib/email");
      // Ideally we would fetch the user's real email from Clerk or DB, but we'll use the routing scheme for now
      await sendEmail({
        to: `student-${result.Attributes.askedBy}@opensolve.user`,
        subject: `Your question has been answered!`,
        body: `An organization has replied to your question on the challenge thread.\n\nAnswer: "${answerText}"\n\nLog in to OpenSolve to view the full discussion.`
      });
    }

    return NextResponse.json({ thread: result.Attributes }, { status: 200 });
  } catch (error) {
    console.error("Error adding QA answer:", error);
    return NextResponse.json({ error: "Failed to add answer" }, { status: 500 });
  }
}
