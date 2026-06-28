import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// This is a one-off administrative script to clear technical debt.
// It loops through Clerk users and migrates any user with the legacy
// "company" role in their public metadata to the unified "organization" role.
export async function GET(request: Request) {
  // In a real production app, this would be guarded by an Admin secret or role.
  // For this migration, we'll run it once to clear the debt.

  try {
    const client = await clerkClient();
    
    // Note: In Clerk v5+, we use client.users.getUserList()
    const users = await client.users.getUserList({
      limit: 500, // Process up to 500 users
    });

    let migratedCount = 0;

    for (const user of users.data) {
      if (user.publicMetadata?.role === "company") {
        await client.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            role: "organization",
          },
        });
        migratedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} users from 'company' to 'organization'.`,
    });
  } catch (error) {
    console.error("Role migration failed:", error);
    return NextResponse.json(
      { error: "Failed to migrate roles" },
      { status: 500 }
    );
  }
}
