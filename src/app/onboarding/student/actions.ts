"use server";

import { currentUser } from "@clerk/nextjs/server";
import { docClient } from "@/lib/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export async function submitStudentOnboarding(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const collegeOrInstitution = formData.get("collegeOrInstitution") as string;
  const degree = formData.get("degree") as string;
  const graduationYear = formData.get("graduationYear") as string;
  const githubUrl = formData.get("githubUrl") as string;
  const linkedinUrl = formData.get("linkedinUrl") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;
  const country = formData.get("country") as string;
  const countryCode = formData.get("countryCode") as string;
  const phone = formData.get("phone") as string;
  const skillsString = formData.get("skills") as string;

  const skills = skillsString
    ? skillsString.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
    : [];

  // Derive githubUsername from URL for backward compatibility
  const githubUsername = githubUrl
    ? githubUrl.replace("https://github.com/", "").replace("http://github.com/", "").split("/")[0]
    : null;

  const profileItem = {
    userId: user.id,
    name,
    bio: bio || null,
    collegeOrInstitution: collegeOrInstitution || null,
    degree: degree || null,
    graduationYear: graduationYear || null,
    githubUrl: githubUrl || null,
    githubUsername: githubUsername || null,
    linkedinUrl: linkedinUrl || null,
    portfolioUrl: portfolioUrl || null,
    country: country || null,
    countryCode: countryCode || null,
    phone: phone && countryCode ? `${countryCode}${phone}` : phone || null,
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

  // Set the profile_complete cookie so middleware stops redirecting to onboarding
  const cookieStore = await cookies();
  cookieStore.set("profile_complete", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  redirect("/dashboard/student");
}
