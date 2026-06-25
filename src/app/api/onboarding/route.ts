import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();
  if (!["student", "company"].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'student' or 'company'." }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
