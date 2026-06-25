"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Send, GitBranch, Globe, Loader2, AlertCircle } from "lucide-react";

export default function SubmitSolution({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [formData, setFormData] = useState({
    githubUrl: "",
    demoUrl: "",
    writeup: "",
  });
  const [team, setTeam] = useState<any>(null);
  const [submitAsTeam, setSubmitAsTeam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  import("react").then((React) => {
    React.useEffect(() => {
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
  });

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
          problemId: params.id,
          studentName: user?.fullName || user?.username || "Anonymous",
          userId: user?.id,
          teamId: submitAsTeam && team ? team.teamId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit solution");
      router.push(`/problems/${params.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-2xl mx-auto pt-16 px-6 lg:px-8 pb-24">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-[#00cbe6]/10 border border-[#00cbe6]/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#00cbe6] mb-6">
          Submitting as: {user?.fullName || user?.primaryEmailAddress?.emailAddress || "You"}
        </div>
        <h1 className="text-3xl md:text-5xl font-display-lg font-bold text-[#dce1fb] leading-tight mb-3">
          Submit Your Solution
        </h1>
        <p className="text-base text-[#8990a8] font-medium">
          Your submission is public and verifiable — make it count.
        </p>
      </div>

      <div className="bg-[#0c1324] border border-[#00cbe6]/30 shadow-[0_0_40px_rgba(0,203,230,0.05)] rounded-3xl p-6 md:p-10">
        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* Team / Solo Toggle */}
          {team && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="block text-sm font-bold text-[#8990a8] mb-4">
                Submission Identity
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(false)}
                  className={`flex-1 p-4 rounded-xl font-bold transition-all ${
                    !submitAsTeam 
                      ? "bg-[#00cbe6]/10 border border-[#00cbe6] text-[#00cbe6]" 
                      : "bg-transparent border border-white/10 text-[#8990a8] hover:border-white/20"
                  }`}
                >
                  Submit Solo
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(true)}
                  className={`flex-1 p-4 rounded-xl font-bold transition-all ${
                    submitAsTeam 
                      ? "bg-[#a078ff]/10 border border-[#a078ff] text-[#a078ff]" 
                      : "bg-transparent border border-white/10 text-[#8990a8] hover:border-white/20"
                  }`}
                >
                  Submit as {team.name}
                </button>
              </div>
            </div>
          )}

          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-bold text-[#8990a8] mb-3">
              <GitBranch size={16} className="inline mr-2 align-middle text-[#00cbe6]" />
              GitHub Repository URL *
            </label>
            <input
              required
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/your-solution"
              className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all font-mono text-sm"
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="block text-sm font-bold text-[#8990a8] mb-3">
              <Globe size={16} className="inline mr-2 align-middle text-[#00cbe6]" />
              Live Demo URL <span className="font-normal text-[#8990a8]/60">(optional)</span>
            </label>
            <input
              type="url"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://your-demo.vercel.app"
              className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all font-mono text-sm"
            />
          </div>

          {/* Writeup */}
          <div>
            <label className="block text-sm font-bold text-[#8990a8] mb-3">
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
              className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-4 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all text-sm resize-y"
            />
            <div className="text-right text-xs text-[#8990a8] mt-2 font-bold">
              {formData.writeup.length} / 500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00cbe6] text-[#020617] font-bold py-4 rounded-xl hover:bg-[#5de6ff] transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(0,203,230,0.3)] hover:shadow-[0_0_30px_rgba(0,203,230,0.5)] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>Submit Solution <Send size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
