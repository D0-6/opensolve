import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // In production, this should be a strong env variable.
  // For local development, we allow a fallback or specific hardcoded string if not set.
  const expectedSecret = process.env.ADMIN_SETUP_SECRET || "super-secret-admin-key";

  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
  }

  try {
    const client = await clerkClient();
    
    // Elevate the user to an admin
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "admin",
      },
    });

    return NextResponse.json({ success: true, message: "User successfully elevated to Admin. Please sign out and sign back in for the new role to take effect in your session claims." });
  } catch (error) {
    console.error("Error setting up admin:", error);
    return NextResponse.json({ error: "Failed to elevate user" }, { status: 500 });
  }
}
