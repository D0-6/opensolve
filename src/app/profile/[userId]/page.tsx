import { docClient } from "@/lib/dynamodb";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { auth } from "@clerk/nextjs/server";
import ProfileClient from "./ProfileClient";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";
const SUBMISSIONS_TABLE = process.env.DYNAMODB_TABLE_SUBMISSIONS || "OpenSolve_Submissions";

export const dynamic = "force-dynamic";

export default async function UserProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { userId: loggedInUserId } = auth();

  const isOwner = loggedInUserId === userId;

  let profile;
  try {
    const res = await docClient.send(new GetCommand({ TableName: PROFILES_TABLE, Key: { userId } }));
    profile = res.Item;
  } catch (err) {
    console.error(err);
  }

  let submissions: any[] = [];
  try {
    const res = await docClient.send(new QueryCommand({
      TableName: SUBMISSIONS_TABLE,
      IndexName: "userId-submittedAt-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId }
    }));
    submissions = res.Items || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <ProfileClient 
      isOwner={isOwner} 
      profile={profile} 
      submissions={submissions} 
      userId={userId} 
    />
  );
}
