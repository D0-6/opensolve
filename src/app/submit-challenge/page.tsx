"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Search, Loader2, CheckCircle2, ExternalLink, Info, X, Trophy, Zap } from "lucide-react";

const DOMAIN_SUGGESTIONS = [
  "Machine Learning / AI", "Web Development", "Mobile (iOS/Android)", "Blockchain / Web3",
  "Data Engineering", "DevOps / Infrastructure", "Cybersecurity", "Fintech",
  "HealthTech", "Climate Tech", "EdTech", "Computer Vision", "NLP / LLM",
  "Robotics / Hardware", "Game Development", "AR / VR",
];

export default function SubmitChallengePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    description: "",
    requirements: "",
    sourceUrl: "",
    prizeAmount: "",
    prizeType: "CASH",
    deadline: "",
    maxTeamSize: "4",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyles = "w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-all text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/challenges/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
          maxTeamSize: parseInt(formData.maxTeamSize, 10),
          prizeAmount: Number(formData.prizeAmount) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit challenge");
      router.push("/submit-challenge/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit challenge");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-400" /></div>;
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pt-28 pb-16 px-6">
      <div className="w-full max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 border border-white/10 bg-white/5 flex items-center justify-center text-blue-400 text-xl">
              🕵️
            </div>
            <div>
              <h1 className="text-3xl font-medium text-white tracking-tight">Scout a Challenge</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Find a real bounty on the internet and share it with the OpenSolve community.</p>
            </div>
          </div>
        </div>

        {/* Scout System Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Trophy size={18} className="text-blue-400" />, title: "Earn Scout Points", desc: "Every approved challenge earns 100 Scout Points on your profile." },
            { icon: <Zap size={18} className="text-blue-400" />, title: "Get a Finder's Cut", desc: "If your challenge is solved and wins prize money, you earn a percentage of the payout." },
            { icon: <Search size={18} className="text-blue-400" />, title: '"Discovered By" Badge', desc: "Your name and profile link are permanently shown on the challenge page." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2 text-white font-semibold text-sm">
                {icon} {title}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-transparent/5 border border-white/10 p-5 mb-8 flex items-start gap-3">
          <Info size={18} className="text-zinc-400 mt-0.5 shrink-0" />
          <div className="text-sm text-zinc-400">
            <strong className="text-white">How it works:</strong> Find a real technical challenge or bounty from a company, hackathon, or government agency. Paste the link and fill in the details. Once our team approves it, it will appear on OpenSolve with your name as the discoverer. If a solver wins prize money from that challenge, you automatically receive <strong>5% of the winnings</strong> as a scout bounty.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 font-medium flex items-center gap-3 text-sm">
            <X size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-transparent border border-white/10 p-8 space-y-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-3">Challenge Source</h2>

            <div>
              <label className={labelStyles}>Original Challenge URL *</label>
              <div className="relative">
                <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://example.com/challenge"
                  className={`${inputStyles} pl-10`}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">The original URL where you found this challenge (Kaggle, GitHub, company website, etc.)</p>
            </div>

            <div>
              <label className={labelStyles}>Challenge Title *</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., NASA Open Data Challenge: Satellite Image Segmentation"
                className={inputStyles}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <label className={labelStyles}>Prize / Reward Type *</label>
                <select
                  value={formData.prizeType}
                  onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })}
                  className={inputStyles}
                >
                  <option value="CASH">Cash Bounty</option>
                  <option value="HIRING">Hiring Offer</option>
                  <option value="CONTRACT">Contract / Freelance</option>
                  <option value="PILOT_FUNDING">Pilot / Grant Funding</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyles}>Prize Amount (USD)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.prizeAmount}
                  onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
                  placeholder="e.g. 5000"
                  className={inputStyles}
                />
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
            </div>
          </div>

          <div className="bg-transparent border border-white/10 p-8 space-y-6">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-3">Challenge Details</h2>

            <div>
              <label className={labelStyles}>
                Problem Statement / Overview *
                <span className="block text-[11px] font-normal text-zinc-400 mt-0.5">Supports Markdown (Headers, Links, Tables, Lists)</span>
              </label>
              <textarea
                required
                rows={12}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="# Challenge Overview&#10;Describe the core problem here...&#10;&#10;## Schedule&#10;- Phase 1: ...&#10;&#10;## Rules&#10;1. ..."
                className={`${inputStyles} font-mono text-sm resize-y`}
              />
            </div>

            <div>
              <label className={labelStyles}>Success Criteria / Requirements</label>
              <textarea
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="What does winning look like? e.g., Accuracy > 95%, must be open source, must include a demo video..."
                className={`${inputStyles} resize-y`}
              />
            </div>

            <div>
              <label className={labelStyles}>Max Team Size</label>
              <select
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
                className={inputStyles}
              >
                <option value="1">Solo only</option>
                <option value="2">Up to 2</option>
                <option value="3">Up to 3</option>
                <option value="4">Up to 4</option>
                <option value="5">Up to 5</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3.5 hover:bg-blue-500 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <Loader2 size={18} className="animate-spin" />
              : <><CheckCircle2 size={18} /> Submit for Review &amp; Earn Scout Points</>
            }
          </button>
          <p className="text-xs text-center text-zinc-400">
            Challenges are reviewed for quality before going live. You'll earn 100 Scout Points immediately upon approval.
          </p>
        </form>
      </div>
    </div>
  );
}
