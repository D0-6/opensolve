import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { incrementPlatformStat } from "@/lib/data";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();
  // Accept both "organization" (used by role-selection page) and "company" (legacy) for backward compatibility
  if (!["student", "company", "organization"].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'student', 'organization', or 'company'." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    
    // Atomic stat increments
    if (role === "student") {
      await incrementPlatformStat("totalStudents", 1);
    } else if (role === "company") {
      await incrementPlatformStat("totalOrgs", 1);
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
