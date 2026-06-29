"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Mail, Loader2, AlertCircle, MessageCircle, X, Send, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Message {
  threadId: string;
  createdAt: string;
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
}

function MessageDrawer({
  threadId,
  studentUserId,
  orgName,
  onClose,
}: {
  threadId: string;
  studentUserId: string;
  orgName: string;
  onClose: () => void;
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?threadId=${encodeURIComponent(threadId)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, [threadId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          text,
          senderName: orgName,
          recipientUserId: studentUserId,
        }),
      });
      setText("");
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-96 bg-transparent border border-white/10 shadow-2xl z-50 flex flex-col" style={{ height: "440px" }}>
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <div>
          <div className="text-sm font-semibold">Message Candidate</div>
          <div className="text-[10px] text-blue-200 uppercase tracking-wider">{threadId.split("#")[1]?.slice(0, 8)}…</div>
        </div>
        <button onClick={onClose}><X size={18} className="text-blue-200 hover:text-white" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent/5">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-zinc-400 pt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.createdAt} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 text-sm rounded-sm ${
                msg.senderId === user?.id
                  ? "bg-blue-600 text-white"
                  : "bg-transparent border border-white/10 text-white"
              }`}>
                <div className="text-[10px] font-bold mb-1 opacity-60 uppercase tracking-wider">{msg.senderName}</div>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-transparent">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 text-sm border border-white/10 px-3 py-2 focus:outline-none focus:border-blue-400 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="p-2 bg-blue-600 text-white hover:opacity-90 disabled:opacity-40"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function EvaluationActions({
  problemId,
  rankKey,
  prizeType,
  submitterName,
  studentUserId,
  orgName = "Organization",
}: {
  problemId: string;
  rankKey: string;
  prizeType: string;
  submitterName: string;
  studentUserId: string;
  orgName?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msgOpen, setMsgOpen] = useState(false);
  const threadId = `${problemId}#${studentUserId}`;

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scores, setScores] = useState({ innovation: 5, technical: 5, design: 5 });

  const handleAction = async (action: "HIRE" | "CONTRACT" | "INTERVIEW" | "REJECT" | "SCORE", rubricScores?: Record<string, number>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submissions/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, rankKey, action, submitterName, studentUserId, rubricScores }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit action");
    } finally {
      setLoading(false);
    }
  };

  const primaryAction = prizeType === "HIRING" ? "HIRE" : prizeType === "INTERNSHIP" ? "INTERNSHIP" : prizeType === "CASH" || prizeType === "CASH_PRIZE" ? "AWARD_PRIZE" : "CONTRACT";
  const primaryText = prizeType === "HIRING" ? "Extend Hire Offer" : prizeType === "INTERNSHIP" ? "Offer Internship" : prizeType === "CASH" || prizeType === "CASH_PRIZE" ? "Award Prize" : "Offer Contract";

  return (
    <>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        {error && (
          <div className="text-blue-400 text-xs mb-1 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </div>
        )}

        <button
          onClick={() => handleAction(primaryAction)}
          disabled={loading}
          className="btn-primary px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> {primaryText}</>}
        </button>

        <button
          onClick={() => handleAction("INTERVIEW")}
          disabled={loading}
          className="btn-secondary px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Mail size={16} /> Request Interview</>}
        </button>

        <button
          onClick={() => setMsgOpen(true)}
          className="px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2 border border-white/20 text-zinc-300 hover:bg-transparent/5 transition-colors"
        >
          <MessageCircle size={16} /> Message Candidate
        </button>

        <button
          onClick={() => setScoreModalOpen(true)}
          className="px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2 border border-blue-400 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors mt-2"
        >
          <Target size={16} /> Score Submission
        </button>

        <button
          onClick={() => handleAction("REJECT")}
          disabled={loading}
          className="px-6 py-2.5 font-medium text-sm flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 transition-colors mt-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Reject (Pass)</>}
        </button>
      </div>

      {scoreModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-transparent max-w-md w-full p-6 shadow-xl border border-white/10">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-blue-400" /> Judging Rubric
            </h3>
            <p className="text-sm text-zinc-400 mb-6">Score this submission on a scale of 1 to 10 for each category.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="flex justify-between text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  <span>Innovation</span>
                  <span className="text-blue-400">{scores.innovation} / 10</span>
                </label>
                <input type="range" min="1" max="10" value={scores.innovation} onChange={e => setScores({ ...scores, innovation: parseInt(e.target.value) })} className="w-full accent-[#1a3a5c]" />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  <span>Technical Difficulty</span>
                  <span className="text-blue-400">{scores.technical} / 10</span>
                </label>
                <input type="range" min="1" max="10" value={scores.technical} onChange={e => setScores({ ...scores, technical: parseInt(e.target.value) })} className="w-full accent-[#1a3a5c]" />
              </div>
              <div>
                <label className="flex justify-between text-sm font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  <span>Design & UX</span>
                  <span className="text-blue-400">{scores.design} / 10</span>
                </label>
                <input type="range" min="1" max="10" value={scores.design} onChange={e => setScores({ ...scores, design: parseInt(e.target.value) })} className="w-full accent-[#1a3a5c]" />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setScoreModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  setScoreModalOpen(false);
                  handleAction("SCORE", scores);
                }}
                className="btn-primary px-6 py-2 text-sm font-medium"
              >
                Submit Score
              </button>
            </div>
          </div>
        </div>
      )}

      {msgOpen && (
        <MessageDrawer
          threadId={threadId}
          studentUserId={studentUserId}
          orgName={orgName}
          onClose={() => setMsgOpen(false)}
        />
      )}
    </>
  );
}
