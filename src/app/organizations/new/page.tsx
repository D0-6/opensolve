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

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "12px", fontSize: "0.9375rem" };

  return (
    <div style={{ maxWidth: "720px", margin: "48px auto 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(var(--accent-2-rgb),0.1)",
            border: "1px solid rgba(var(--accent-2-rgb),0.2)",
            borderRadius: "100px",
            padding: "4px 12px",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--accent-2)",
            marginBottom: "16px",
          }}
        >
          <Building2 size={12} /> For Companies & Orgs
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, marginBottom: "8px" }}>
          Post a Challenge
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9375rem" }}>
          Describe your real problem. Thousands of builders will compete to solve it.
        </p>
      </div>

      <div className="glass" style={{ borderRadius: "24px", padding: "36px" }}>
        {error && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px", color: "#f87171", fontSize: "0.875rem" }}>
            <AlertCircle size={16} style={{ marginTop: "1px", flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {field("Challenge Title *",
            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Build an AI system for crop disease detection" style={inputStyle} />
          )}

          {field("Problem Description *",
            <textarea required rows={5} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the problem in detail. What should a winning solution look like? What constraints exist?" style={{ ...inputStyle, resize: "none" }} />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {field("Category",
              <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} style={inputStyle}>
                <option value="INDUSTRY">Industry / Startup</option>
                <option value="GOVERNMENT">Government / Public Sector</option>
                <option value="YC_STARTUP">YC Startup</option>
              </select>
            )}
            {field("Domain *",
              <input required type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g. AI / Machine Learning" style={inputStyle} />
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {field("Reward Type",
              <select value={formData.prizeType} onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })} style={inputStyle}>
                <option value="CASH">Cash Prize</option>
                <option value="CONTRACT">Contract / Project</option>
                <option value="HIRING">Full-time Hire</option>
                <option value="PILOT_FUNDING">Pilot Funding</option>
                <option value="EQUITY">Equity / Co-founder</option>
              </select>
            )}
            {field("Prize Amount (USD, if applicable)",
              <input type="number" min="0" value={formData.prizeAmount} onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })} placeholder="e.g. 10000" style={inputStyle} />
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {field("Submission Deadline *",
              <input required type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} style={inputStyle} />
            )}
            {field("Source URL (optional)",
              <input type="url" value={formData.sourceUrl} onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} placeholder="https://your-company.com/challenge" style={inputStyle} />
            )}
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
              <><PlusCircle size={18} /> Publish Challenge</>
            )}
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
