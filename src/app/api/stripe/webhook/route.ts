import { NextResponse } from "next/server";
import Stripe from "stripe";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-12-18.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const problemId = session.metadata?.problemId;

    if (problemId) {
      // Update the problem status to OPEN and mark as FUNDED
      try {
        await docClient.send(
          new UpdateCommand({
            TableName: PROBLEMS_TABLE,
            Key: { problemId },
            UpdateExpression: "SET isPaid = :paid, paymentStatus = :funded, escrowSessionId = :sid",
            ExpressionAttributeValues: {
              ":paid": true,
              ":funded": "FUNDED",
              ":sid": session.id,
            },
          })
        );
        console.log(`Successfully funded escrow for problem: ${problemId}`);
      } catch (dbError) {
        console.error("DynamoDB update failed for escrow funding:", dbError);
        return NextResponse.json({ error: "Database Error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
