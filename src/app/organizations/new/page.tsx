"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { PlusCircle, Loader2, Building2, AlertCircle } from "lucide-react";

export default function NewProblem() {
  const router = useRouter();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "INDUSTRY",
    sourceUrl: "",
    prizeAmount: "",
    prizeType: "CASH",
    deadline: "",
    domain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
          postedByOrgId: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post challenge");
      router.push(`/problems/${data.problem.problemId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body-md";
  const labelClass = "text-sm font-semibold text-on-surface-variant mb-2 block";

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold text-primary mb-4">
            <Building2 size={14} /> For Companies & Orgs
          </div>
          <h1 className="font-display-lg text-4xl text-on-surface font-bold mb-2">
            Post a Challenge
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Describe your real problem. Thousands of builders will compete to solve it.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Challenge Title *</label>
              <input 
                required 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                placeholder="e.g. Build an AI system for crop disease detection" 
                className={inputClass}
                style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
              />
            </div>

            <div>
              <label className={labelClass}>Problem Description *</label>
              <textarea 
                required 
                rows={6} 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Describe the problem in detail. What should a winning solution look like? What constraints exist?" 
                className={`${inputClass} resize-none`}
                style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Category</label>
                <select 
                  value={formData.source} 
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })} 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
                >
                  <option value="INDUSTRY">Industry / Startup</option>
                  <option value="GOVERNMENT">Government / Public Sector</option>
                  <option value="YC_STARTUP">YC Startup</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Domain *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.domain} 
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })} 
                  placeholder="e.g. AI / Machine Learning" 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Reward Type</label>
                <select 
                  value={formData.prizeType} 
                  onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })} 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
                >
                  <option value="CASH">Cash Prize</option>
                  <option value="CONTRACT">Contract / Project</option>
                  <option value="HIRING">Full-time Hire</option>
                  <option value="PILOT_FUNDING">Pilot Funding</option>
                  <option value="EQUITY">Equity / Co-founder</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Prize Amount (USD)</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.prizeAmount} 
                  onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })} 
                  placeholder="e.g. 10000" 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Submission Deadline *</label>
                <input 
                  required 
                  type="date" 
                  value={formData.deadline} 
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb", colorScheme: "dark" }}
                />
              </div>
              <div>
                <label className={labelClass}>Source URL (optional)</label>
                <input 
                  type="url" 
                  value={formData.sourceUrl} 
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} 
                  placeholder="https://your-company.com/challenge" 
                  className={inputClass}
                  style={{ backgroundColor: "#151b2d", color: "#dce1fb" }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00cbe6] hover:bg-[#5de6ff] text-[#001f25] font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <><PlusCircle size={20} /> Publish Challenge</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
