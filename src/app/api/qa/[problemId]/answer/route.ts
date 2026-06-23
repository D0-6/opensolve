import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { checkRateLimit } from "@/lib/rate-limit";

const TABLE_NAME = process.env.DYNAMODB_TABLE_QATHREADS || "OpenSolve_QAThreads";

export async function POST(
  request: Request,
  { params }: { params: { problemId: string } }
) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { problemId } = params;

  try {
    const body = await request.json();
    const { sk, answeredBy, answerText } = body;

    if (!sk || !answeredBy || !answerText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newAnswer = {
      answeredBy,
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

    return NextResponse.json({ thread: result.Attributes }, { status: 200 });
  } catch (error) {
    console.error("Error adding QA answer:", error);
    return NextResponse.json({ error: "Failed to add answer" }, { status: 500 });
  }
}
