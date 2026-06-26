"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Send, GitBranch, Globe, Loader2, AlertCircle } from "lucide-react";

export default function SubmitSolution({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== "student")) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);

  const [formData, setFormData] = useState({
    githubUrl: "",
    demoUrl: "",
    writeup: "",
  });
  const [team, setTeam] = useState<any>(null);
  const [submitAsTeam, setSubmitAsTeam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(data => {
        if (data.team) {
          setTeam(data.team);
          setSubmitAsTeam(true);
        }
      })
      .catch(console.error);
  }, []);

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
          problemId: unwrappedParams?.id,
          studentName: user?.fullName || user?.username || "Anonymous",
          userId: user?.id,
          teamId: submitAsTeam && team ? team.teamId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit solution");
      if (unwrappedParams) {
        router.push(`/problems/${unwrappedParams.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user || user.publicMetadata?.role !== "student" || !unwrappedParams) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto pt-24 px-6 lg:px-8 pb-24 min-h-screen bg-white">
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 mb-6 uppercase tracking-wide">
          Submitting as: {user?.fullName || user?.primaryEmailAddress?.emailAddress || "You"}
        </div>
        <h1 className="text-3xl md:text-5xl font-medium text-zinc-900 leading-tight mb-3 tracking-tight">
          Submit Your Solution
        </h1>
        <p className="text-base text-zinc-500">
          Your submission is public and verifiable — make it count.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 p-6 md:p-10">
        {error && (
          <div className="flex items-start gap-3 bg-[#1a3a5c]/10 border border-[#1a3a5c]/20 text-[#1a3a5c] p-4 mb-8 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Team / Solo Toggle */}
          {team && (
            <div className="bg-zinc-50 border border-zinc-200 p-6">
              <label className="block text-xs font-bold text-zinc-500 mb-4 uppercase tracking-wider">
                Submission Identity
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(false)}
                  className={`flex-1 p-3 text-sm font-medium transition-all border ${
                    !submitAsTeam 
                      ? "bg-white text-zinc-900 border-zinc-300 shadow-sm" 
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Submit Solo
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(true)}
                  className={`flex-1 p-3 text-sm font-medium transition-all border ${
                    submitAsTeam 
                      ? "bg-white text-zinc-900 border-zinc-300 shadow-sm" 
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  Submit as {team.name}
                </button>
              </div>
            </div>
          )}

          {/* GitHub URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
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
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors font-mono text-sm"
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
              <Globe size={14} className="inline mr-1.5 align-text-bottom text-zinc-400" />
              Live Demo URL <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="url"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://your-demo.vercel.app"
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors font-mono text-sm"
            />
          </div>

          {/* Writeup */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
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
              className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm resize-y"
            />
            <div className="text-right text-xs text-zinc-400 mt-2 font-medium">
              {formData.writeup.length} / 500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary font-medium py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:hover:bg-[#1a3a5c]"
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
