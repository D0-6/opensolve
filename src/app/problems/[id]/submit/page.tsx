"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export default function SubmitSolution({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentName: "",
    userId: "", // Typically from session, we'll prompt for mock value
    githubUrl: "",
    demoUrl: "",
    writeup: "",
    honeypot: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic client-side validation
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    if (!githubRegex.test(formData.githubUrl)) {
      setError("Please provide a valid GitHub repository URL (e.g., https://github.com/user/repo)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, problemId: params.id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit solution");
      }
      
      router.push(`/problems/${params.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 glass-panel p-8 rounded-3xl">
      <h1 className="text-3xl font-bold mb-6">Submit Your Solution</h1>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field (hidden from screen readers and visual flow) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="honeypot">Leave this field empty</label>
          <input type="text" id="honeypot" name="honeypot" value={formData.honeypot} onChange={handleChange} tabIndex={-1} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Student/Team Name</label>
            <input required type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="Ada Lovelace" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">User ID (Mock)</label>
            <input required type="text" name="userId" value={formData.userId} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="user-123" />
            <p className="text-xs text-slate-500 mt-1">Hackathon: Enter any string to act as your ID.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GitHub Repository URL</label>
          <input required type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="https://github.com/yourusername/repo" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Live Demo URL <span className="text-slate-400 font-normal">(Optional)</span></label>
          <input type="url" name="demoUrl" value={formData.demoUrl} onChange={handleChange} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="https://your-demo.vercel.app" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Writeup (Max 500 chars)</label>
          <textarea required name="writeup" maxLength={500} value={formData.writeup} onChange={handleChange} rows={4} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none" placeholder="Explain your approach, tech stack, and why your solution stands out..."></textarea>
          <div className="text-right text-xs text-slate-500 mt-1">
            {formData.writeup.length} / 500
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-blue-500/20">
          {loading ? "Submitting..." : (
            <>Submit Solution <Send className="w-5 h-5" /></>
          )}
        </button>
      </form>
    </div>
  );
}
