"use server";

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

const ORG_TABLE = process.env.DYNAMODB_TABLE_ORGANIZATIONS || "OpenSolve_Organizations";

export async function submitOrganizationOnboarding(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const orgName = formData.get("orgName") as string;
  const orgType = formData.get("orgType") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string;
  const logoUrl = formData.get("logoUrl") as string;

  const orgId = randomUUID();

  const orgItem = {
    orgId,
    clerkUserId: user.id, // Keep a reference to the creator
    orgName,
    orgType,
    contactEmail,
    website: website || null,
    logoUrl: logoUrl || null,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: ORG_TABLE,
      Item: orgItem,
    })
  );

  // Update Clerk user metadata with their new orgId
  await clerkClient().users.updateUserMetadata(user.id, {
    publicMetadata: {
      orgId: orgId,
    },
  });

  redirect(`/organizations/${orgId}/dashboard`);
}
