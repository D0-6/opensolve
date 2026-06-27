"use client";

import { useEffect, useState } from "react";
import { GitBranch, Play, ArrowUpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardSubmission {
  rankKey: string;
  userId: string;
  studentName: string;
  githubUrl: string;
  repoName?: string;
  demoUrl?: string;
  writeup: string;
  score: number;
}

export default function ClientLeaderboard({ problemId }: { problemId: string }) {
  const [submissions, setSubmissions] = useState<LeaderboardSubmission[]>([]);
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
      <div className="flex flex-col">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-zinc-200 py-6 animate-pulse flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-zinc-200 rounded w-1/4" />
              <div className="h-3 bg-zinc-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center text-zinc-500 font-medium">
        No submissions yet. Be the first to solve this!
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {submissions.map((sub, index) => (
          <motion.div
            key={sub.rankKey}
            layout // This enables the subtle transition on rank changes
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-zinc-200 py-6 flex items-start gap-4 group"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold text-zinc-500 shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <a href={`/profile/${sub.userId}`} className="font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors truncate">{sub.studentName}</a>
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full text-xs ml-4 shrink-0">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  {sub.score}
                </div>
              </div>
              <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{sub.writeup}</p>
              <div className="flex gap-4 mt-3">
                <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                  <GitBranch className="w-3.5 h-3.5" /> {sub.repoName}
                </a>
                {sub.demoUrl && (
                  <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
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
