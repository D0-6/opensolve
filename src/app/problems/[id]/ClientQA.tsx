"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";

export default function ClientQA({ problemId }: { problemId: string }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // In a real app we'd get this from session context
  const MOCK_USER_ID = "mock-user-id"; 

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
      await fetch(`/api/qa/${problemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askedBy: MOCK_USER_ID, questionText: question })
      });
      setQuestion("");
      await fetchThreads();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No questions yet.
          </div>
        ) : (
          threads.map((thread) => (
            <div key={thread.sk} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="font-semibold text-sm mb-1">User {thread.askedBy.substring(0,6)}</div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{thread.questionText}</p>
              {/* Simplification: Not showing full answers UI for hackathon scope to save space, but it's supported in API */}
              {thread.answers?.length > 0 && (
                <div className="mt-3 pl-3 border-l-2 border-blue-500 text-xs text-slate-600 dark:text-slate-400">
                  {thread.answers.length} reply
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={submitting}
        />
        <button 
          type="submit"
          disabled={submitting || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
