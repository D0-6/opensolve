"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Link as LinkIcon, AlertCircle, Loader2, Trophy, Briefcase, Globe, Target } from "lucide-react";

const DOMAIN_SUGGESTIONS = [
  "Machine Learning / AI", "Web Development", "Mobile (iOS/Android)", "Blockchain / Web3",
  "Data Engineering", "DevOps / Infrastructure", "Cybersecurity", "Fintech",
  "HealthTech", "Climate Tech", "EdTech", "Computer Vision", "NLP / LLM",
  "Robotics / Hardware", "Game Development", "AR / VR",
];

export default function SubmitChallengeLink() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sourceUrl: "",
    title: "",
    domain: "",
    deadline: "",
    prizeAmount: "",
  });

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit challenge");

      router.push("/challenges?success=true");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-white border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] transition-all text-sm rounded-md shadow-sm";
  const labelStyles = "block text-sm font-semibold text-zinc-700 mb-2";

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-28 pb-16 px-6">
      <div className="w-full max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
            <LinkIcon size={28} className="text-[#1a3a5c]" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Submit a Challenge</h1>
          <p className="text-zinc-500 text-base max-w-lg mx-auto">
            Found an interesting bounty, hackathon, or problem online? Share it with the community and earn <span className="font-semibold text-amber-500">Scout Points</span>.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className={labelStyles}>URL to the Challenge *</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  required
                  type="url"
                  placeholder="https://news.ycombinator.com/item?id=..."
                  className={`${inputStyles} pl-11`}
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">Link directly to the source page or application form.</p>
            </div>

            <div>
              <label className={labelStyles}>Challenge Title *</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="e.g., Build an Open Source Vector DB"
                  className={`${inputStyles} pl-11`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyles}>Domain / Tech Stack *</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    required
                    type="text"
                    list="domain-suggestions"
                    placeholder="e.g., AI / ML"
                    className={`${inputStyles} pl-11`}
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                  <datalist id="domain-suggestions">
                    {DOMAIN_SUGGESTIONS.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Deadline *</label>
                <input
                  required
                  type="date"
                  className={inputStyles}
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelStyles}>Prize / Bounty (USD) - Optional</label>
              <div className="relative">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 5000"
                  className={`${inputStyles} pl-11`}
                  value={formData.prizeAmount}
                  onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 mt-8 border-t border-zinc-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a5c] text-white font-medium py-3.5 rounded-lg hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Submit to Directory</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
