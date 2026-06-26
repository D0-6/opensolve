"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EvaluationActions({ 
  problemId, 
  rankKey, 
  prizeType, 
  submitterName, 
  studentUserId 
}: { 
  problemId: string, 
  rankKey: string, 
  prizeType: string, 
  submitterName: string, 
  studentUserId: string 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "HIRE" | "CONTRACT" | "INTERVIEW") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submissions/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, rankKey, action, submitterName, studentUserId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      router.refresh(); // Refresh the page to show updated status
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit action");
    } finally {
      setLoading(false);
    }
  };

  const primaryAction = prizeType === "HIRING" ? "HIRE" : "CONTRACT";
  const primaryText = prizeType === "HIRING" ? "Extend Hire Offer" : "Offer Contract";

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto">
      {error && <div className="text-[#1a3a5c] text-xs mb-1 flex items-center gap-1"><AlertCircle size={12}/> {error}</div>}
      
      <button 
        onClick={() => handleAction(primaryAction)}
        disabled={loading}
        className="btn-primary px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin"/> : <><CheckCircle2 size={16}/> {primaryText}</>}
      </button>
      
      <button 
        onClick={() => handleAction("INTERVIEW")}
        disabled={loading}
        className="btn-secondary px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin"/> : <><Mail size={16}/> Request Interview</>}
      </button>
    </div>
  );
}
