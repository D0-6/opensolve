"use client";

import { useEffect, useState } from "react";
import { GitBranch, Play, ArrowUpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLeaderboard({ problemId }: { problemId: string }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/submissions?problemId=${problemId}`);
        const data = await res.json();
        // DynamoDB query returns ascending by SK (which is inverse score), so higher scores are first!
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000); // Live polling every 10s
    return () => clearInterval(interval);
  }, [problemId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-xl h-24 animate-pulse flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-xl text-center text-slate-500">
        No submissions yet. Be the first to solve this!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {submissions.map((sub, index) => (
          <motion.div
            key={sub.rankKey}
            layout // This enables the subtle transition on rank changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-5 rounded-xl flex items-center gap-4 group hover:border-blue-500/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
              #{index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <a href={`/profile/${sub.userId}`} className="font-semibold hover:text-blue-500">{sub.studentName}</a>
                <div className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full text-xs">
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  {sub.score}
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">{sub.writeup}</p>
              <div className="flex gap-3 mt-3">
                <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-500">
                  <GitBranch className="w-3.5 h-3.5" /> {sub.repoName}
                </a>
                {sub.demoUrl && (
                  <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-blue-500">
                    <Play className="w-3.5 h-3.5" /> Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
