import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2024-12-18.acacia" as any, // fallback to any to avoid type complaints on newer SDKs
});

const PROBLEMS_TABLE = process.env.DYNAMODB_TABLE_PROBLEMS || "OpenSolve_Problems";

export async function POST(request: Request) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (!user || role !== "organization") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { problemId } = await request.json();

    if (!problemId) {
      return NextResponse.json({ error: "Missing problemId" }, { status: 400 });
    }

    // Verify the problem belongs to this organization
    const res = await docClient.send(
      new GetCommand({
        TableName: PROBLEMS_TABLE,
        Key: { problemId },
      })
    );

    const problem = res.Item;

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    if (problem.postedByOrgId !== (user.publicMetadata?.orgId || user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (problem.prizeAmount <= 0) {
      return NextResponse.json({ error: "This problem does not require escrow funding" }, { status: 400 });
    }

    if (problem.isPaid) {
      return NextResponse.json({ error: "This problem is already funded" }, { status: 400 });
    }

    const hostUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Bounty Escrow: ${problem.title}`,
              description: "100% of these funds are reserved for the prize. (99.5% to the winning student, 0.5% OpenSolve processing fee).",
            },
            unit_amount: problem.prizeAmount * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${hostUrl}/organizations/${problem.postedByOrgId}/dashboard?escrow_success=true`,
      cancel_url: `${hostUrl}/organizations/${problem.postedByOrgId}/dashboard?escrow_cancelled=true`,
      client_reference_id: problemId,
      metadata: {
        problemId: problemId,
        orgId: problem.postedByOrgId as string,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
