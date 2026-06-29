"use client";

import { useState } from "react";
import { Megaphone, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostAnnouncementButton({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/problems/${problemId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle("");
      setContent("");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to post announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 hover:bg-amber-100 transition-colors"
      >
        <Megaphone size={14} /> Post Update
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <form
            onSubmit={handleSubmit}
            className="bg-transparent w-full max-w-lg shadow-2xl border border-white/10"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Megaphone size={18} className="text-amber-500" /> Post Challenge Update
              </h3>
              <button type="button" onClick={() => setOpen(false)}>
                <X size={20} className="text-zinc-400 hover:text-zinc-300" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 text-sm px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Update Title *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  placeholder="e.g., Deadline Extended to August 15th"
                  className="w-full border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-[#1a3a5c] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Update Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  placeholder="Provide details about this update. All builders who applied will be notified."
                  className="w-full border border-white/20 px-4 py-3 text-sm focus:outline-none focus:border-[#1a3a5c] transition-colors resize-none"
                />
                <div className="text-xs text-zinc-400 mt-1 text-right">{content.length}/2000</div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-3 border border-white/10 text-zinc-300 text-sm font-medium hover:bg-transparent/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#112740] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Publish Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
