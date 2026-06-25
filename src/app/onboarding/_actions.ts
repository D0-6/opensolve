"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboardingAction() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Update the user's public metadata in Clerk
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      onboardingComplete: true,
    },
  });

  // Set the cookie so the middleware knows onboarding is complete
  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
  });

  redirect("/");
}

export async function setOnboardingCookieOnly() {
  // Used for cross-device sync when Clerk already has the metadata but the cookie is missing
  const cookieStore = await cookies();
  cookieStore.set("onboarding_complete", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 10,
  });
  redirect("/");
}
