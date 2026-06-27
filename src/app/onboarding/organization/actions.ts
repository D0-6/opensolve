"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { clerkClient } from "@clerk/nextjs/server";

const ORG_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

export async function submitOrganizationOnboarding(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const orgName = formData.get("orgName") as string;
  const orgType = formData.get("orgType") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const description = formData.get("description") as string;
  const industry = formData.get("industry") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const teamSize = formData.get("teamSize") as string;

  const orgId = randomUUID();

  const orgItem = {
    orgId,
    clerkUserId: user.id,
    orgName,
    orgType,
    contactEmail,
    website: website || null,
    logoUrl: logoUrl || null,
    description: description || null,
    industry: industry || null,
    city: city || null,
    country: country || null,
    linkedinUrl: linkedinUrl || null,
    teamSize: teamSize || null,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: ORG_TABLE,
      Item: orgItem,
    })
  );

  // Update Clerk user metadata with both role and orgId so the dashboard
  // dispatcher can correctly route this user on subsequent visits.
  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: {
      role: "organization",
      orgId: orgId,
    },
  });

  redirect(`/organizations/${orgId}/dashboard`);
}
