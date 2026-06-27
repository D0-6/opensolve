import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { submitStudentOnboarding } from "./actions";

// ISO 3166-1 alpha-2 codes with dial codes — subset of most common
const COUNTRIES_WITH_CODES = [
  { name: "India", code: "IN", dial: "+91" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Ethiopia", code: "ET", dial: "+251" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "South Korea", code: "KR", dial: "+82" },
  { name: "China", code: "CN", dial: "+86" },
  { name: "Vietnam", code: "VN", dial: "+84" },
  { name: "Thailand", code: "TH", dial: "+66" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "Romania", code: "RO", dial: "+40" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Portugal", code: "PT", dial: "+351" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Norway", code: "NO", dial: "+47" },
  { name: "Denmark", code: "DK", dial: "+45" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Jordan", code: "JO", dial: "+962" },
  { name: "Morocco", code: "MA", dial: "+212" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Other", code: "OTHER", dial: "" },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR - 2 + i));

export default async function StudentOnboardingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const defaultName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const defaultEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || "";

  const inputStyles = "w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider";
  const sectionHeader = "text-xs font-semibold text-zinc-500 mb-5 pb-3 border-b border-zinc-200 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-6">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Complete Your Builder Profile</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Fill in your details so organizations can find you, contact you, and evaluate your candidacy. This takes about 2 minutes.
          </p>
          {defaultEmail && (
            <p className="text-xs text-zinc-400 mt-1">Signed in as <span className="font-semibold text-zinc-600">{defaultEmail}</span></p>
          )}
        </div>

        <form action={submitStudentOnboarding} className="space-y-6">

          {/* Section 1: Personal */}
          <div className="bg-white border border-zinc-200 p-8">
            <h2 className={sectionHeader}>Personal Information</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className={labelStyles}>Full Name *</label>
                <input
                  required
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={defaultName}
                  className={inputStyles}
                  placeholder="Satoshi Nakamoto"
                />
              </div>
              <div>
                <label htmlFor="bio" className={labelStyles}>Bio <span className="font-normal normal-case tracking-normal text-zinc-400">(max 500 chars)</span></label>
                <textarea
                  id="bio"
                  name="bio"
                  maxLength={500}
                  rows={4}
                  className={`${inputStyles} resize-none`}
                  placeholder="I build scalable distributed systems and dabble in smart contracts. Passionate about open-source and solving real-world problems..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Education */}
          <div className="bg-white border border-zinc-200 p-8">
            <h2 className={sectionHeader}>Education</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="collegeOrInstitution" className={labelStyles}>College / Institution</label>
                <input
                  id="collegeOrInstitution"
                  name="collegeOrInstitution"
                  type="text"
                  className={inputStyles}
                  placeholder="IIT Bombay, Stanford University, or Self-taught"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="degree" className={labelStyles}>Degree / Program</label>
                  <input
                    id="degree"
                    name="degree"
                    type="text"
                    className={inputStyles}
                    placeholder="B.Tech Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor="graduationYear" className={labelStyles}>Graduation Year</label>
                  <select id="graduationYear" name="graduationYear" className={inputStyles}>
                    <option value="">Select year...</option>
                    {GRAD_YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Links */}
          <div className="bg-white border border-zinc-200 p-8">
            <h2 className={sectionHeader}>Online Presence</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="githubUrl" className={labelStyles}>GitHub Profile URL *</label>
                <input
                  required
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  className={`${inputStyles} font-mono`}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label htmlFor="linkedinUrl" className={labelStyles}>LinkedIn Profile URL</label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  className={inputStyles}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label htmlFor="portfolioUrl" className={labelStyles}>Portfolio / Website</label>
                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  className={inputStyles}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Location */}
          <div className="bg-white border border-zinc-200 p-8">
            <h2 className={sectionHeader}>Contact & Location</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="country" className={labelStyles}>Country *</label>
                <select required id="country" name="country" className={inputStyles}>
                  <option value="">Select your country...</option>
                  {COUNTRIES_WITH_CODES.map(({ name, code }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <p className="text-xs text-zinc-400 mt-1">Used for country-restricted challenges — we don&apos;t share this publicly.</p>
              </div>

              <div>
                <label htmlFor="phone" className={labelStyles}>Phone Number <span className="font-normal normal-case tracking-normal text-zinc-400">(optional — only visible to orgs that contact you)</span></label>
                <div className="flex gap-0">
                  <select
                    id="countryCode"
                    name="countryCode"
                    className="bg-white border border-zinc-300 border-r-0 px-3 py-3 text-zinc-900 focus:outline-none focus:border-[#1a3a5c] text-sm w-auto min-w-[100px]"
                  >
                    <option value="">Dial</option>
                    {COUNTRIES_WITH_CODES.filter(c => c.dial).map(({ name, code, dial }) => (
                      <option key={code} value={dial}>{dial} ({name.slice(0, 12)})</option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`${inputStyles} flex-1`}
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Skills */}
          <div className="bg-white border border-zinc-200 p-8">
            <h2 className={sectionHeader}>Skills</h2>
            <div>
              <label htmlFor="skills" className={labelStyles}>
                Skills <span className="font-normal normal-case tracking-normal text-zinc-400">(comma separated)</span>
              </label>
              <input
                id="skills"
                name="skills"
                type="text"
                className={inputStyles}
                placeholder="React, Node.js, Python, Machine Learning, AWS, PostgreSQL"
              />
              <p className="text-xs text-zinc-400 mt-2">These appear on your public profile and help match you to relevant challenges.</p>
            </div>
          </div>

          <div className="pb-8">
            <button
              type="submit"
              className="w-full bg-[#1a3a5c] text-white font-medium py-4 hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2"
            >
              Save Profile & Go to Dashboard →
            </button>
            <p className="text-xs text-center text-zinc-400 mt-3">
              You can update all of this from your profile page at any time.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
