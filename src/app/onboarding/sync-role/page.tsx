import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function SyncRolePage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const { userId } = auth();
  const role = searchParams.role;

  if (!userId) {
    redirect("/sign-up");
  }

  if (role !== "student" && role !== "organization") {
    // Fallback if role wasn't provided or is invalid
    redirect("/sign-up");
  }

  // Write to Clerk's publicMetadata
  await clerkClient().users.updateUserMetadata(userId, {
    publicMetadata: {
      role: role,
    },
  });

  // Redirect to their respective onboarding flows
  redirect(`/onboarding/${role}`);
}
