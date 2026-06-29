import { getDocClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { auth, clerkClient } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";
import { getUserSubmissions } from "@/lib/data";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export const dynamic = "force-dynamic";

export default async function UserProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { userId: loggedInUserId } = await auth();

  const isOwner = loggedInUserId === userId;

  let profile;
  let fallbackName = "";
  let imageUrl = "";
  let viewerRole = "";

  try {
    const res = await getDocClient().send(new GetCommand({ TableName: PROFILES_TABLE, Key: { userId } }));
    profile = res.Item;
  } catch (err) {
    console.error(err);
  }

  try {
    const clerk = await clerkClient();
    const targetUser = await clerk.users.getUser(userId);
    if (targetUser) {
      fallbackName = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(" ");
      imageUrl = targetUser.imageUrl;
    }

    // Fetch the viewer's role so we know whether to expose the candidate's phone number
    if (loggedInUserId && loggedInUserId !== userId) {
      const loggedInUser = await clerk.users.getUser(loggedInUserId);
      viewerRole = (loggedInUser.publicMetadata?.role as string) || "";
    }
  } catch (err) {
    console.error("Failed to fetch user from Clerk", err);
  }

  let submissions: any[] = [];
  try {
    submissions = await getUserSubmissions(userId);
  } catch (err) {
    console.error(err);
  }

  return (
    <ProfileClient
      isOwner={isOwner}
      profile={profile || {}}
      submissions={submissions}
      userId={userId}
      fallbackName={fallbackName}
      imageUrl={imageUrl}
      viewerRole={viewerRole}
    />
  );
}
