import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { submitOrganizationOnboarding } from "./actions";

export default async function OrganizationOnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const defaultEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-xl w-full bg-white border border-zinc-200 p-8">
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Organization Profile</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Register your company or program to post challenges and start hiring vetted talent.
          </p>
        </div>

        <form action={submitOrganizationOnboarding} className="space-y-6">
          <div>
            <label htmlFor="orgName" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Organization Name *
            </label>
            <input
              required
              id="orgName"
              name="orgName"
              type="text"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label htmlFor="orgType" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Organization Type *
            </label>
            <select
              required
              id="orgType"
              name="orgType"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
            >
              <option value="INDUSTRY">Enterprise / Corporate</option>
              <option value="YC_STARTUP">YC / VC-Backed Startup</option>
              <option value="GOVERNMENT">Government / Non-Profit</option>
            </select>
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Contact Email *
            </label>
            <input
              required
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={defaultEmail}
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="founders@acmecorp.com"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Website URL (Optional)
            </label>
            <input
              id="website"
              name="website"
              type="url"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="https://acmecorp.com"
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              Logo URL (Optional)
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm"
              placeholder="https://acmecorp.com/logo.png"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <button
              type="submit"
              className="w-full bg-[#1a3a5c] text-white font-medium py-3 hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2"
            >
              Register Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
