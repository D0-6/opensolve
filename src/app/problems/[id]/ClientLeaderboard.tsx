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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/submissions?problemId=${problemId}`);
        const data = await res.json();
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
        {submissions.map((sub, index) => {
          const isExpanded = expandedId === sub.rankKey;
          
          return (
            <motion.div
              key={sub.rankKey}
              layout // This enables the subtle transition on rank changes
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-b border-zinc-200 py-6 flex items-start gap-4 group cursor-pointer transition-colors hover:bg-zinc-50 ${isExpanded ? 'bg-zinc-50' : ''}`}
              onClick={() => setExpandedId(isExpanded ? null : sub.rankKey)}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold text-zinc-500 shrink-0 mt-1">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between">
                  <a 
                    href={`/profile/${sub.userId}`} 
                    onClick={(e) => e.stopPropagation()} 
                    className="font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors truncate"
                  >
                    {sub.studentName}
                  </a>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full text-xs ml-4 shrink-0">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-zinc-500" />
                    {sub.score}
                  </div>
                </div>
                
                {isExpanded ? (
                  <div className="mt-4 space-y-4">
                    <div className="prose prose-zinc max-w-none text-sm text-zinc-700 whitespace-pre-wrap bg-white p-4 border border-zinc-200 shadow-sm">
                      {sub.writeup}
                    </div>
                    
                    {sub.demoUrl && (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Demo Video</span>
                        {/* Only try to iframe youtube/loom/vimeo, otherwise just show link */}
                        {sub.demoUrl.includes("youtube.com") || sub.demoUrl.includes("youtu.be") || sub.demoUrl.includes("loom.com") ? (
                          <div className="aspect-video w-full bg-zinc-100 border border-zinc-200">
                            <iframe 
                              src={sub.demoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                              className="w-full h-full" 
                              allowFullScreen 
                            />
                          </div>
                        ) : (
                          <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#1a3a5c] hover:underline text-sm font-medium flex items-center gap-1">
                            <Play className="w-4 h-4" /> Watch Demo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600 mt-1 line-clamp-2">{sub.writeup}</p>
                )}
                
                <div className="flex gap-4 mt-3">
                  <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                    <GitBranch className="w-3.5 h-3.5" /> {sub.repoName || "GitHub Repo"}
                  </a>
                  {!isExpanded && sub.demoUrl && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <Play className="w-3.5 h-3.5" /> Demo Available
                    </div>
                  )}
                  <div className="ml-auto text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-zinc-600 transition-colors">
                    {isExpanded ? 'Collapse' : 'Expand Details'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
