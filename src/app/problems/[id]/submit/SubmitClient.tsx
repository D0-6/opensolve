"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, GitBranch, Globe, Loader2, AlertCircle, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SubmitClient({ 
  problemId, 
  problemTitle,
  teamMembers 
}: { 
  problemId: string; 
  problemTitle: string;
  teamMembers: any[];
}) {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    techStack: "",
    writeup: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasTeam = teamMembers && teamMembers.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9_.-]+)\/?$/;
    if (!githubRegex.test(formData.githubUrl)) {
      setError("Please provide a valid GitHub repo URL (e.g. https://github.com/user/repo)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          techStack: formData.techStack.split(",").map(t => t.trim()).filter(Boolean),
          problemId,
          studentName: user?.fullName || user?.username || "Anonymous",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit solution");
      router.push(`/problems/${problemId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-12 md:pt-24 px-6 lg:px-8 pb-24 min-h-screen bg-transparent">
      
      <Link href={`/problems/${problemId}/team`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Team Formation
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-medium text-white leading-tight mb-3 tracking-tight">
          Submit Solution
        </h1>
        <p className="text-base text-zinc-400">
          Submitting final deliverable for <strong className="text-zinc-200">{problemTitle}</strong>.
        </p>
      </div>

      <div className="bg-transparent border border-white/10 p-6 md:p-10">
        {error && (
          <div className="flex items-start gap-3 bg-blue-600/10 border border-blue-400/20 text-blue-400 p-4 mb-8 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Identity Display */}
          <div className="bg-white/5 border border-white/10 p-6">
            <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">
              Submission Identity
            </label>
            {hasTeam ? (
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                  <Users size={16} className="text-zinc-400" /> Submitting as a Team
                </div>
                <div className="text-xs text-zinc-400">
                  Members: You, {teamMembers.map(m => m.name).join(", ")}
                </div>
              </div>
            ) : (
              <div className="text-sm font-medium text-white">
                Submitting Solo (You)
              </div>
            )}
          </div>

          {/* GitHub URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              <GitBranch size={14} className="inline mr-1.5 align-text-bottom text-zinc-400" />
              GitHub Repository URL *
            </label>
            <input
              required
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/your-solution"
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm"
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              <Globe size={14} className="inline mr-1.5 align-text-bottom text-zinc-400" />
              Live Demo URL <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="url"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://your-demo.vercel.app"
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm"
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Video Walkthrough / Pitch <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Tech Stack
            </label>
            <input
              type="text"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="Next.js, Python, DynamoDB, Tailwind..."
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-zinc-400 mt-2">Comma separated (e.g. React, Node.js, AWS)</p>
          </div>

          {/* Writeup */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Solution Writeup *
            </label>
            <textarea
              required
              name="writeup"
              value={formData.writeup}
              onChange={handleChange}
              maxLength={500}
              rows={6}
              placeholder="Explain your approach, tech stack, key decisions, and why your solution stands out..."
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 transition-colors text-sm resize-y"
            />
            <div className="text-right text-xs text-zinc-400 mt-2 font-medium">
              {formData.writeup.length} / 500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-medium py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:bg-blue-600"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Submit Solution <Send size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
