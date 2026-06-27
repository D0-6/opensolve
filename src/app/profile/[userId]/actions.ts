"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { revalidatePath } from "next/cache";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function updateProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;
  const country = formData.get("country") as string;
  const countryCode = formData.get("countryCode") as string;
  const phone = formData.get("phone") as string;
  const collegeOrInstitution = formData.get("collegeOrInstitution") as string;
  const degree = formData.get("degree") as string;
  const graduationYear = formData.get("graduationYear") as string;
  const skillsString = formData.get("skills") as string;

  const skills = skillsString
    ? skillsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  // Derive githubUsername from URL for backward compatibility with components
  // that display github.com/username links
  const githubUsername = githubUrl
    ? githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").split("/")[0]
    : null;

  await docClient.send(
    new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: user.id },
      UpdateExpression: `SET
        bio = :bio,
        githubUrl = :githubUrl,
        githubUsername = :gh,
        linkedinUrl = :li,
        portfolioUrl = :portfolio,
        country = :country,
        countryCode = :countryCode,
        phone = :phone,
        collegeOrInstitution = :college,
        degree = :degree,
        graduationYear = :gradYear,
        skills = :skills,
        #name = :name
      `,
      ExpressionAttributeNames: {
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":bio": bio || null,
        ":githubUrl": githubUrl || null,
        ":gh": githubUsername || null,
        ":li": linkedinUrl || null,
        ":portfolio": portfolioUrl || null,
        ":country": country || null,
        ":countryCode": countryCode || null,
        ":phone": phone ? `${countryCode || ""}${phone}` : null,
        ":college": collegeOrInstitution || null,
        ":degree": degree || null,
        ":gradYear": graduationYear || null,
        ":skills": skills,
        ":name": name || null,
      },
    })
  );

  revalidatePath(`/profile/${user.id}`);
}
