import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function SyncRolePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { userId } = await auth();
  const { role } = await searchParams;

  if (!userId) {
    redirect("/sign-up");
  }

  if (role !== "student" && role !== "organization") {
    // Fallback if role wasn't provided or is invalid
    redirect("/sign-up");
  }

  // Write to Clerk's publicMetadata
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role,
    },
  });

  // Redirect to their respective onboarding flows
  redirect(`/onboarding/${role}`);
}
