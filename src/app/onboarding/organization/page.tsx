import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { submitOrganizationOnboarding } from "./actions";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
  "Cambodia", "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic",
  "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia",
  "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Hungary", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait",
  "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway",
  "Pakistan", "Palestine", "Panama", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore",
  "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden",
  "Switzerland", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Zimbabwe",
];

const INDUSTRIES = [
  "Aerospace & Defense", "Agriculture & AgriTech", "Artificial Intelligence",
  "Automotive & Mobility", "Banking & Financial Services", "Biotech & Life Sciences",
  "Climate Tech & Clean Energy", "Cybersecurity", "Education & EdTech",
  "E-Commerce & Retail", "Enterprise Software", "FinTech", "Gaming",
  "Government & Public Sector", "Healthcare & MedTech", "Infrastructure",
  "Legal Tech", "Logistics & Supply Chain", "Manufacturing",
  "Media & Entertainment", "Non-Profit", "Real Estate & PropTech",
  "Social Impact", "Telecommunications", "Travel & Hospitality",
];

export default async function OrganizationOnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const defaultEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || "";

  const inputStyles = "w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-6">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Organization Profile</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Register your company, startup, or government program to post challenges and start hiring vetted talent.
          </p>
        </div>

        <form action={submitOrganizationOnboarding} className="space-y-0">

          {/* Section 1: Identity */}
          <div className="bg-white border border-zinc-200 p-8 mb-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-6 pb-3 border-b border-zinc-200 uppercase tracking-wider text-xs text-zinc-500">
              Organization Identity
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="orgName" className={labelStyles}>Organization Name *</label>
                <input
                  required
                  id="orgName"
                  name="orgName"
                  type="text"
                  className={inputStyles}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="orgType" className={labelStyles}>Organization Type *</label>
                  <select required id="orgType" name="orgType" className={inputStyles}>
                    <option value="INDUSTRY">Enterprise / Corporate</option>
                    <option value="YC_STARTUP">YC / VC-Backed Startup</option>
                    <option value="GOVERNMENT">Government / Non-Profit</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="industry" className={labelStyles}>Industry *</label>
                  <select required id="industry" name="industry" className={inputStyles}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className={labelStyles}>Organization Description *</label>
                <textarea
                  required
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  className={`${inputStyles} resize-none`}
                  placeholder="Brief description of what your organization does, your mission, and why builders should work with you..."
                />
              </div>

              <div>
                <label htmlFor="teamSize" className={labelStyles}>Company Size</label>
                <select id="teamSize" name="teamSize" className={inputStyles}>
                  <option value="">Select size...</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-1000">201–1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact */}
          <div className="bg-white border border-zinc-200 p-8 mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 mb-6 pb-3 border-b border-zinc-200 uppercase tracking-wider">
              Contact & Location
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="contactEmail" className={labelStyles}>Contact Email *</label>
                <input
                  required
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={defaultEmail}
                  className={inputStyles}
                  placeholder="founders@acmecorp.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="country" className={labelStyles}>Country *</label>
                  <select required id="country" name="country" className={inputStyles}>
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className={labelStyles}>City (Optional)</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={inputStyles}
                    placeholder="San Francisco"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Online Presence */}
          <div className="bg-white border border-zinc-200 p-8 mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 mb-6 pb-3 border-b border-zinc-200 uppercase tracking-wider">
              Online Presence
            </h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="website" className={labelStyles}>Website URL</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  className={inputStyles}
                  placeholder="https://acmecorp.com"
                />
              </div>
              <div>
                <label htmlFor="linkedinUrl" className={labelStyles}>LinkedIn Company Page</label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  className={inputStyles}
                  placeholder="https://linkedin.com/company/acmecorp"
                />
              </div>
              <div>
                <label htmlFor="logoUrl" className={labelStyles}>Logo URL (Optional)</label>
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  className={inputStyles}
                  placeholder="https://acmecorp.com/logo.png"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#1a3a5c] text-white font-medium py-3.5 hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2"
            >
              Register Organization & Go to Dashboard
            </button>
            <p className="text-xs text-center text-zinc-400 mt-3">
              By registering, you agree to evaluate submitted solutions fairly and contact top talent within 30 days.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
