"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Building2, Plus, X, Loader2, Link as LinkIcon, FileText, Briefcase, CheckCircle2, Globe, Tag } from "lucide-react";

const COUNTRY_OPTIONS = [
  { code: "ALL", name: "Open to All Countries" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "ZA", name: "South Africa" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "OTHER", name: "Other (specify in description)" },
];

const DOMAIN_SUGGESTIONS = [
  "Machine Learning / AI", "Web Development", "Mobile (iOS/Android)", "Blockchain / Web3",
  "Data Engineering", "DevOps / Infrastructure", "Cybersecurity", "Fintech",
  "HealthTech", "Climate Tech", "EdTech", "Computer Vision", "NLP / LLM",
  "Robotics / Hardware", "Game Development", "AR / VR",
];

export default function ProfessionalPostChallenge() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && (!user || (user.publicMetadata?.role !== "organization" && user.publicMetadata?.role !== "company"))) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    description: "",
    requirements: "",
    source: "INDUSTRY",
    sourceUrl: "",
    prizeAmount: "",
    prizeType: "CONTRACT",
    deadline: "",
    maxTeamSize: "4",
  });

  const [resourceLinks, setResourceLinks] = useState<string[]>([""]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [allowedCountries, setAllowedCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddLink = () => setResourceLinks([...resourceLinks, ""]);
  const handleLinkChange = (index: number, value: string) => {
    const updated = [...resourceLinks];
    updated[index] = value;
    setResourceLinks(updated);
  };
  const handleRemoveLink = (index: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== index));
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
      setSkillInput("");
    }
  };
  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleCountryToggle = (code: string) => {
    if (code === "ALL") {
      setAllowedCountries([]);
      return;
    }
    setAllowedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validLinks = resourceLinks.filter(link => link.trim() !== "");

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
          resourceLinks: validLinks,
          requiredSkills,
          allowedCountries: allowedCountries.length > 0 ? allowedCountries : [],
          maxTeamSize: parseInt(formData.maxTeamSize, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post challenge");
      router.push(`/organizations/${user?.publicMetadata?.orgId}/dashboard`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post problem");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-all text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider";

  if (!isLoaded || !user || (user.publicMetadata?.role !== "organization" && user.publicMetadata?.role !== "company")) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-6">
      <div className="w-full max-w-[125rem] mx-auto">

        {/* Header */}
        <div className="mb-10 border-b border-zinc-200 pb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Post a Challenge</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Define a real problem, set your outcome, and attract vetted builders.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8 font-medium flex items-center gap-3 text-sm">
            <X size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section 1: Challenge Details */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-200">
                <FileText size={18} className="text-[#1a3a5c]" />
                <h2 className="text-base font-semibold text-zinc-900">Challenge Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={labelStyles}>Challenge Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Build a Fraud Detection Model for Real-Time Transactions"
                    className={inputStyles}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyles}>Technical Domain *</label>
                    <input
                      required
                      type="text"
                      list="domain-suggestions"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="e.g., Machine Learning"
                      className={inputStyles}
                    />
                    <datalist id="domain-suggestions">
                      {DOMAIN_SUGGESTIONS.map(d => <option key={d} value={d} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className={labelStyles}>Organization Type</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className={inputStyles}
                    >
                      <option value="INDUSTRY">Enterprise / Corporate</option>
                      <option value="YC_STARTUP">YC / VC-Backed Startup</option>
                      <option value="GOVERNMENT">Government / Non-Profit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>Problem Statement *</label>
                  <textarea
                    required
                    rows={7}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the core problem in depth. Include: background context, technical constraints, current bottlenecks, data available, expected outputs, and evaluation criteria. The more detailed, the better quality submissions you'll receive."
                    className={`${inputStyles} resize-y`}
                  />
                </div>

                <div>
                  <label className={labelStyles}>Success Criteria / Requirements</label>
                  <textarea
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="What does a winning solution look like? e.g., Accuracy > 95%, latency < 100ms, must use Python, must include unit tests..."
                    className={`${inputStyles} resize-y`}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Required Skills */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-200">
                <Tag size={18} className="text-[#1a3a5c]" />
                <h2 className="text-base font-semibold text-zinc-900">Required Skills</h2>
              </div>
              <p className="text-sm text-zinc-500 mb-4">Tag skills builders need. This helps surface the challenge to the right talent.</p>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }}}
                  placeholder="e.g. Python, PyTorch, SQL"
                  className={`${inputStyles} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 bg-zinc-900 text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-zinc-400 hover:text-red-500 transition-colors ml-1">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Resources */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <LinkIcon size={18} className="text-[#1a3a5c]" />
                  <h2 className="text-base font-semibold text-zinc-900">Datasets & Resources</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:bg-zinc-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Link
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-4">Provide links to datasets, documentation, APIs, or GitHub repos builders will need.</p>
              <div className="space-y-3">
                {resourceLinks.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder="https://..."
                      className={inputStyles}
                    />
                    {resourceLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="p-3 border border-zinc-200 text-zinc-500 hover:text-red-500 hover:border-red-200 transition-colors bg-white"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Section 4: Country Restrictions */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-200">
                <Globe size={18} className="text-[#1a3a5c]" />
                <h2 className="text-base font-semibold text-zinc-900">Country Eligibility</h2>
              </div>
              <p className="text-sm text-zinc-500 mb-5">
                Leave all unchecked to allow global submissions. Select specific countries to restrict eligibility (e.g. for regulatory reasons or local hiring).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COUNTRY_OPTIONS.map(({ code, name }) => {
                  const isSelected = code === "ALL" ? allowedCountries.length === 0 : allowedCountries.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleCountryToggle(code)}
                      className={`text-left px-3 py-2.5 text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-[#1a3a5c] bg-[#1a3a5c]/5 text-[#1a3a5c] font-bold"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar: Logistics */}
          <div>
            <div className="bg-zinc-50 border border-zinc-200 p-6 sticky top-24 space-y-6">
              <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-200">
                <Briefcase size={18} className="text-[#1a3a5c]" /> Outcome & Logistics
              </h3>

              <div>
                <label className={labelStyles}>Outcome / Reward *</label>
                <select
                  value={formData.prizeType}
                  onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })}
                  className={inputStyles}
                >
                  <option value="HIRING">Full-Time Hiring Offer</option>
                  <option value="CONTRACT">Paid Contract / Freelance</option>
                  <option value="CASH">Cash Bounty</option>
                  <option value="PILOT_FUNDING">Pilot Program Funding</option>
                  <option value="INTERNSHIP">Internship Offer</option>
                </select>
              </div>

              <div>
                <label className={labelStyles}>Budget / Prize (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.prizeAmount}
                  onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                  placeholder="e.g. 5000"
                  className={inputStyles}
                />
                <p className="text-xs text-zinc-400 mt-1">Leave blank if contract value is negotiable.</p>
              </div>

              <div>
                <label className={labelStyles}>Submission Deadline *</label>
                <input
                  required
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className={labelStyles}>Max Team Size</label>
                <select
                  value={formData.maxTeamSize}
                  onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
                  className={inputStyles}
                >
                  <option value="1">Solo only (1 person)</option>
                  <option value="2">Up to 2 people</option>
                  <option value="3">Up to 3 people</option>
                  <option value="4">Up to 4 people</option>
                  <option value="5">Up to 5 people</option>
                </select>
              </div>

              <div>
                <label className={labelStyles}>Reference / Org URL</label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://your-company.com"
                  className={inputStyles}
                />
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a5c] text-white font-medium py-3 hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Publish to Talent Pool</>}
                </button>
                <p className="text-xs text-center text-zinc-400 mt-3">
                  By publishing, you agree to fairly evaluate all submissions within 30 days of the deadline.
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
