import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Building2 } from "lucide-react";
import Link from "next/link";

/**
 * Role selection page — shown to users who have accepted the TOS but
 * have not yet been assigned a role. This is an edge case that occurs when:
 * - Account was created before roles were added to the system
 * - A Clerk metadata update silently failed during signup
 */

async function setRoleAction(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = formData.get("role") as string;
  if (role !== "student" && role !== "organization") {
    redirect("/onboarding/role-selection");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { role },
  });

  redirect(`/onboarding/${role}`);
}

export default async function RoleSelectionPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">How are you joining?</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Choose your role — this determines what you can do on OpenSolve.
          </p>
        </div>

        <form action={setRoleAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="submit"
            name="role"
            value="student"
            className="group text-left bg-white border-2 border-zinc-200 p-6 hover:border-[#1a3a5c] transition-all focus:outline-none focus:border-[#1a3a5c]"
          >
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4 group-hover:border-[#1a3a5c] group-hover:text-[#1a3a5c] transition-colors">
              <Users size={24} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Builder / Student</h2>
            <p className="text-sm text-zinc-500">
              Browse challenges, submit solutions, build your portfolio, and get hired by top companies.
            </p>
          </button>

          <button
            type="submit"
            name="role"
            value="organization"
            className="group text-left bg-white border-2 border-zinc-200 p-6 hover:border-[#1a3a5c] transition-all focus:outline-none focus:border-[#1a3a5c]"
          >
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4 group-hover:border-[#1a3a5c] group-hover:text-[#1a3a5c] transition-colors">
              <Building2 size={24} />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">Organization</h2>
            <p className="text-sm text-zinc-500">
              Post real-world challenges, evaluate submissions, and hire directly from a vetted talent pool.
            </p>
          </button>
        </form>

        <p className="text-xs text-zinc-400 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-zinc-600 hover:text-zinc-900 font-medium">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
