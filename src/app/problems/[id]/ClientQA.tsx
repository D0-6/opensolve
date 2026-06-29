"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";

interface QAThread {
  sk: string;
  askedBy: string;
  askerName?: string;
  questionText: string;
  answers?: unknown[];
}

export default function ClientQA({ problemId }: { problemId: string }) {
  const [threads, setThreads] = useState<QAThread[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchThreads = async () => {
    try {
      const res = await fetch(`/api/qa/${problemId}`);
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [problemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/qa/${problemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText: question })
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to post question. Please make sure you are signed in.");
        return;
      }
      setQuestion("");
      await fetchThreads();
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center text-zinc-400 py-12 border border-white/10 border-dashed">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 text-zinc-300" />
            <span className="text-sm">No questions yet.</span>
          </div>
        ) : (
          threads.map((thread) => (
            <div key={thread.sk} className="bg-white/5 p-4 border border-white/10">
              <div className="font-semibold text-white text-sm mb-1">{thread.askerName || `User ${thread.askedBy.substring(0,6)}`}</div>
              <p className="text-sm text-zinc-300">{thread.questionText}</p>
              {thread.answers && thread.answers.length > 0 && (
                <div className="mt-3 pl-3 border-l-2 border-blue-400 text-xs text-zinc-400 font-medium">
                  {thread.answers.length} reply
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-transparent border border-white/20 py-3 pl-4 pr-12 focus:outline-none focus:border-blue-400 text-sm text-white placeholder:text-zinc-400 transition-colors"
          disabled={submitting}
        />
        <button 
          type="submit"
          disabled={submitting || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-500 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
