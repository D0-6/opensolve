"use client";

import { useState } from "react";
import { Megaphone, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  postedAt: string;
}

interface AnnouncementsPanelProps {
  problemId: string;
  announcements: Announcement[];
}

export default function AnnouncementsPanel({ problemId, announcements }: AnnouncementsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!announcements || announcements.length === 0) {
    return null; // Don't show the panel if there are no announcements
  }

  return (
    <div>
      <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2 flex items-center gap-2">
        <Megaphone size={18} className="text-amber-500" />
        Updates
        <span className="ml-auto text-sm font-normal text-zinc-400">{announcements.length}</span>
      </h2>

      <div className="space-y-3">
        {announcements.map((ann) => (
          <div key={ann.id} className="border border-zinc-200 bg-white">
            <button
              onClick={() => setExpanded(expanded === ann.id ? null : ann.id)}
              className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-zinc-50 transition-colors"
            >
              <div>
                <div className="font-semibold text-zinc-900 text-sm">{ann.title}</div>
                <div className="text-xs text-zinc-400 mt-1">
                  {formatDistanceToNow(new Date(ann.postedAt), { addSuffix: true })}
                </div>
              </div>
              {expanded === ann.id ? (
                <ChevronUp size={16} className="text-zinc-400 shrink-0 mt-1" />
              ) : (
                <ChevronDown size={16} className="text-zinc-400 shrink-0 mt-1" />
              )}
            </button>

            {expanded === ann.id && (
              <div className="px-5 pb-5 border-t border-zinc-100 pt-4">
                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
