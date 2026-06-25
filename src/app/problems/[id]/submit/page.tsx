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
    <div
      style={{
        maxWidth: "640px",
        margin: "48px auto 0",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(var(--accent-rgb),0.1)",
            border: "1px solid rgba(var(--accent-rgb),0.2)",
            borderRadius: "100px",
            padding: "4px 12px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent)",
            marginBottom: "16px",
          }}
        >
          Submitting as: {user?.fullName || user?.primaryEmailAddress?.emailAddress || "You"}
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "8px" }}>
          Submit Your Solution
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem" }}>
          Your submission is public and verifiable — make it count.
        </p>
      </div>

      <div
        className="glass"
        style={{ borderRadius: "24px", padding: "36px" }}
      >
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "24px",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={16} style={{ marginTop: "1px", flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Team / Solo Toggle */}
          {team && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
                Submission Identity
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: submitAsTeam ? "1px solid rgba(255,255,255,0.1)" : "1px solid #00cbe6", background: submitAsTeam ? "transparent" : "rgba(0,203,230,0.1)", color: submitAsTeam ? "var(--text-secondary)" : "#00cbe6", fontWeight: "bold", transition: "all 0.2s" }}
                >
                  Submit Solo
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitAsTeam(true)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: !submitAsTeam ? "1px solid rgba(255,255,255,0.1)" : "1px solid #a078ff", background: !submitAsTeam ? "transparent" : "rgba(160,120,255,0.1)", color: !submitAsTeam ? "var(--text-secondary)" : "#a078ff", fontWeight: "bold", transition: "all 0.2s" }}
                >
                  Submit as {team.name}
                </button>
              </div>
            </div>
          )}

          {/* GitHub URL */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>
              <GitBranch size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              GitHub Repository URL *
            </label>
            <input
              required
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername/your-solution"
              className="w-full bg-[#0c1324] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all font-body-md"
            />
          </div>

          {/* Demo URL */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>
              <Globe size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Live Demo URL{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="url"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://your-demo.vercel.app"
              className="w-full bg-[#0c1324] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all font-body-md"
            />
          </div>

          {/* Writeup */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>
              Solution Writeup *
            </label>
            <textarea
              required
              name="writeup"
              value={formData.writeup}
              onChange={handleChange}
              maxLength={500}
              rows={5}
              placeholder="Explain your approach, tech stack, key decisions, and why your solution stands out..."
              className="w-full bg-[#0c1324] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#00cbe6]/50 transition-all font-body-md resize-y"
            />
            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {formData.writeup.length} / 500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: "14px", borderRadius: "14px", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <>Submit Solution <Send size={16} /></>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
