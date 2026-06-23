"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

export default function NewProblem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "INDUSTRY",
    sourceUrl: "",
    prizeAmount: "",
    prizeType: "CASH",
    deadline: "",
    domain: "",
    postedByOrgId: "mock-org-123" // In a real app, from auth session
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, deadline: new Date(formData.deadline).toISOString() })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/problems/${data.problem.problemId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 glass-panel p-8 rounded-3xl">
      <h1 className="text-3xl font-bold mb-6">Post a New Problem</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea required rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Source Type</label>
            <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="INDUSTRY">Industry</option>
              <option value="GOVERNMENT">Government</option>
              <option value="YC_STARTUP">YC Startup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Domain (e.g. AI, Biotech)</label>
            <input required type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prize Type</label>
            <select value={formData.prizeType} onChange={(e) => setFormData({...formData, prizeType: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="CASH">Cash</option>
              <option value="CONTRACT">Contract</option>
              <option value="HIRING">Hiring</option>
              <option value="PILOT_FUNDING">Pilot Funding</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Prize Amount ($) <span className="text-slate-400 font-normal">(if applicable)</span></label>
            <input type="number" value={formData.prizeAmount} onChange={(e) => setFormData({...formData, prizeAmount: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deadline</label>
          <input required type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
          {loading ? "Posting..." : <><PlusCircle className="w-5 h-5"/> Post Problem</>}
        </button>
      </form>
    </div>
  );
}
