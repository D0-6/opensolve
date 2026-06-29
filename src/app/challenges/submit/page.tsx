"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Link as LinkIcon, AlertCircle, Loader2, Trophy, Briefcase, Globe, Target, Image as ImageIcon, Save, Check } from "lucide-react";

const DOMAIN_SUGGESTIONS = [
  "Machine Learning / AI", "Web Development", "Mobile (iOS/Android)", "Blockchain / Web3",
  "Data Engineering", "DevOps / Infrastructure", "Cybersecurity", "Fintech",
  "HealthTech", "Climate Tech", "EdTech", "Computer Vision", "NLP / LLM",
  "Robotics / Hardware", "Game Development", "AR / VR",
];

export default function SubmitChallengeLink() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState<"draft" | "publish" | "image" | false>(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sourceUrl: "",
    title: "",
    domain: "",
    deadline: "",
    prizeAmount: "",
    description: "",
  });

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>;

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading("image");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch(`/api/upload/image`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");

      const imageUrl = data.data.url;
      const markdownImage = `![Image](${imageUrl})\n`;
      
      setFormData(prev => ({
        ...prev,
        description: prev.description + markdownImage
      }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (status: "DRAFT" | "OPEN") => {
    setLoading(status === "DRAFT" ? "draft" : "publish");
    setError("");

    try {
      const res = await fetch("/api/challenges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save challenge");

      if (status === "OPEN") {
        router.push("/challenges?success=true");
      } else {
        router.push("/organizations/dashboard?draft_saved=true");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-white border border-zinc-200 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] focus:ring-1 focus:ring-[#1a3a5c] transition-all text-sm rounded-md shadow-sm";
  const labelStyles = "block text-sm font-semibold text-zinc-700 mb-2";

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-28 pb-16 px-6">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
            <Target size={28} className="text-[#1a3a5c]" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Host a Challenge</h1>
          <p className="text-zinc-500 text-base max-w-lg mx-auto">
            Build your challenge landing page. Use our Markdown editor to format rules, schedule, and prizes.
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
          <div className="space-y-6">
            
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

            <div>
              <label className={labelStyles}>External Application URL (Optional)</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="url"
                  placeholder="https://your-company.com/apply"
                  className={`${inputStyles} pl-11`}
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">If you want users to apply off-platform, link it here.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-zinc-700">Challenge Description & Rules *</label>
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="image-upload" 
                    className="hidden" 
                    onChange={handleUploadImage} 
                    disabled={loading === "image"}
                  />
                  <label 
                    htmlFor="image-upload"
                    className="flex items-center gap-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded cursor-pointer transition-colors"
                  >
                    {loading === "image" ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    Upload Image
                  </label>
                </div>
              </div>
              <textarea
                required
                rows={16}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="# Overview&#10;Describe the challenge...&#10;&#10;## Rules&#10;1. Rule one...&#10;&#10;## Judging Criteria&#10;- Innovation (1-10)&#10;- Design (1-10)"
                className={`${inputStyles} font-mono text-sm resize-y`}
              />
              <p className="text-xs text-zinc-500 mt-2">Supports full Markdown formatting (Headers, Links, Tables).</p>
            </div>

            <div className="pt-4 mt-8 border-t border-zinc-100 flex items-center gap-4 justify-end">
              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                disabled={!!loading}
                className="px-6 py-3 font-medium text-sm flex items-center justify-center gap-2 text-zinc-700 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
              >
                {loading === "draft" ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save as Draft</>}
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("OPEN")}
                disabled={!!loading}
                className="bg-[#1a3a5c] text-white font-medium px-8 py-3 rounded-lg hover:bg-[#112740] transition-colors text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {loading === "publish" ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Publish Challenge</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
