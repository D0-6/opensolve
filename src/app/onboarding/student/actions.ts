"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function submitStudentOnboarding(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const collegeOrInstitution = formData.get("collegeOrInstitution") as string;
  const githubUsername = formData.get("githubUsername") as string;
  const skillsString = formData.get("skills") as string;

  const skills = skillsString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const profileItem = {
    userId: user.id,
    name,
    bio: bio || null,
    collegeOrInstitution: collegeOrInstitution || null,
    githubUsername: githubUsername || null,
    skills,
    totalScore: 0,
    submissionIds: [],
    joinedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: PROFILES_TABLE,
      Item: profileItem,
    })
  );

  redirect(`/profile/${user.id}`);
}
