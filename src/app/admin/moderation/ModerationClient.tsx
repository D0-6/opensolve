"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";

interface Problem {
  problemId: string;
  title: string;
  sourceUrl: string;
  scoutName?: string;
  scoutId?: string;
  postedAt?: string;
  [key: string]: unknown;
}

export default function ModerationClient({ initialProblems }: { initialProblems: Problem[] }) {
  const [problems, setProblems] = useState(initialProblems);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (problemId: string, action: "APPROVE" | "REJECT") => {
    setProcessing(problemId);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, action }),
      });

      if (!res.ok) throw new Error("Failed to process action");

      setProblems(prev => prev.filter(p => p.problemId !== problemId));
    } catch (err) {
      console.error(err);
      alert("Failed to perform action.");
    } finally {
      setProcessing(null);
    }
  };

  if (problems.length === 0) {
    return (
      <div className="bg-transparent border border-white/10 rounded-xl p-12 text-center shadow-sm">
        <ShieldCheck size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">All caught up!</h3>
        <p className="text-zinc-400 mt-2">There are no pending submissions in the queue right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {problems.map((problem) => (
        <div key={problem.problemId} className="bg-transparent border border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center">
          
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Community Submission
              </span>
              <span className="text-xs text-zinc-400">
                Submitted {problem.postedAt ? formatDistanceToNow(new Date(problem.postedAt), { addSuffix: true }) : "recently"}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1">{problem.title}</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-zinc-400 mt-3">
              <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#1a3a5c] hover:underline font-medium">
                <ExternalLink size={14} /> View Original Source
              </a>
              <span className="hidden sm:block text-zinc-300">•</span>
              <span>Scouted by: <strong>{String(problem.scoutName || "Anonymous")}</strong></span>
            </div>
          </div>

          <div className="bg-transparent/5 border-t md:border-t-0 md:border-l border-white/10 p-4 md:p-6 flex flex-row md:flex-col gap-3 justify-end sm:justify-start">
            <button
              onClick={() => handleAction(problem.problemId, "APPROVE")}
              disabled={processing === problem.problemId}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {processing === problem.problemId ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Approve</>}
            </button>
            <button
              onClick={() => handleAction(problem.problemId, "REJECT")}
              disabled={processing === problem.problemId}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {processing === problem.problemId ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Reject (Delete)</>}
            </button>
          </div>
          
        </div>
      ))}
    </div>
  );
}
