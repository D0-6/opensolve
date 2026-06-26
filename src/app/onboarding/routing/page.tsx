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
    // Edge case: account created before roles existed
    redirect("/onboarding/role-selection");
  }

  if (role === "student") {
    // Check if they have a profile
    try {
      const getCommand = new GetCommand({
        TableName: PROFILES_TABLE,
        Key: { userId: user.id },
      });
      const result = await docClient.send(getCommand);
      
      if (!result.Item) {
        redirect("/onboarding/student");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
    
    // Profile exists, go to profile
    redirect(`/profile/${user.id}`);
  }

  if (role === "organization" || role === "company") {
    // Check if they have an orgId assigned in metadata
    const orgId = user.publicMetadata?.orgId as string | undefined;
    
    if (!orgId) {
      // They haven't finished organization onboarding
      redirect("/onboarding/organization");
    }

    // Finished onboarding, go to dashboard
    redirect(`/organizations/${orgId}/dashboard`);
  }

  // Fallback
  redirect("/");
}
