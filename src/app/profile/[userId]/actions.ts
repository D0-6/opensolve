"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function updateProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const bio = formData.get("bio") as string;
  const githubUsername = formData.get("githubUsername") as string;
  const skillsString = formData.get("skills") as string;

  const skills = skillsString
    ? skillsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  await docClient.send(
    new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: user.id },
      UpdateExpression: "SET bio = :bio, githubUsername = :gh, skills = :skills",
      ExpressionAttributeValues: {
        ":bio": bio || null,
        ":gh": githubUsername || null,
        ":skills": skills,
      },
    })
  );

  revalidatePath(`/profile/${user.id}`);
}
