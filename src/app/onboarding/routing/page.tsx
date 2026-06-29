import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export default async function OnboardingRoutingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.publicMetadata?.role as string | undefined;

  if (!role) {
    // Account has accepted TOS but has no role — send to role selection
    redirect("/onboarding/role-selection");
  }

  if (role === "student") {
    // Check if they have a profile in DynamoDB
    let hasProfile = false;
    try {
      const result = await docClient.send(
        new GetCommand({
          TableName: PROFILES_TABLE,
          Key: { userId: user.id },
        })
      );
      hasProfile = !!result.Item;
    } catch (error) {
      console.error("Error checking profile:", error);
      // On DynamoDB error, assume they have a profile to avoid re-onboarding loop
      hasProfile = true;
    }

    if (!hasProfile) {
      redirect("/onboarding/student");
    }

    // Profile exists — go directly to dashboard
    redirect("/dashboard/student");
  }

  if (role === "organization" || role === "company") {
    const orgId = user.publicMetadata?.orgId as string | undefined;

    if (!orgId) {
      // They haven't finished organization onboarding
      redirect("/onboarding/organization");
    }

    redirect(`/organizations/${orgId}/dashboard`);
  }

  // Fallback for any unrecognized role
  redirect("/");
}
