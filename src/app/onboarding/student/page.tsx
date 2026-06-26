import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { submitStudentOnboarding } from "./actions";

export default async function StudentOnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-xl w-full bg-white border border-zinc-200 p-8">
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Complete Your Profile</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Set up your builder profile to start competing in challenges and getting hired.
          </p>
        </div>

        <form action={submitStudentOnboarding} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              required
              id="name"
              name="name"
              type="text"
              defaultValue={`${user.firstName || ""} ${user.lastName || ""}`.trim()}
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="Satoshi Nakamoto"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Bio (Optional, max 200 chars)
            </label>
            <textarea
              id="bio"
              name="bio"
              maxLength={200}
              rows={3}
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm resize-none"
              placeholder="I build scalable distributed systems and dabble in smart contracts."
            />
          </div>

          <div>
            <label htmlFor="collegeOrInstitution" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              College or Institution (Optional)
            </label>
            <input
              id="collegeOrInstitution"
              name="collegeOrInstitution"
              type="text"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="MIT, Stanford, or self-taught"
            />
          </div>

          <div>
            <label htmlFor="githubUsername" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              GitHub Username (Optional)
            </label>
            <input
              id="githubUsername"
              name="githubUsername"
              type="text"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm font-mono"
              placeholder="octocat"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Skills (Comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="React, Python, Machine Learning, AWS"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <button
              type="submit"
              className="w-full bg-[#1a3a5c] text-white font-medium py-3 hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2"
            >
              Save Profile & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
