"use client";

import { useState } from "react";
import { searchUsers, addTeammate, removeTeammate } from "./actions";
import { Search, Plus, Trash2, Users, ArrowRight, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeamFormationClient({
  problemId,
  maxTeamSize,
  currentMembers,
}: {
  problemId: string;
  maxTeamSize: number;
  currentMembers: any[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // currentMembers length + 1 (the creator)
  const isFull = currentMembers.length + 1 >= maxTeamSize;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 3) {
      setIsSearching(true);
      const res = await searchUsers(val);
      setResults(res);
      setIsSearching(false);
    } else {
      setResults([]);
    }
  };

  const handleAdd = async (userId: string, name: string) => {
    setIsUpdating(true);
    try {
      const result: any = await addTeammate(problemId, userId, name, currentMembers);
      if (result && result.error) {
        alert(result.error);
      } else {
        setQuery("");
        setResults([]);
      }
    } catch (error: any) {
      alert(error.message || "Failed to add teammate.");
    }
    setIsUpdating(false);
    router.refresh();
  };

  const handleRemove = async (userId: string) => {
    setIsUpdating(true);
    await removeTeammate(problemId, userId, currentMembers);
    setIsUpdating(false);
    router.refresh();
  };

  return (
    <div className="space-y-12">
      {/* Current Team */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200">
          <h2 className="text-xl font-medium text-zinc-900 flex items-center gap-2">
            <Users size={20} /> Your Team
          </h2>
          <div className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
            {currentMembers.length + 1} / {maxTeamSize} Members
          </div>
        </div>

        {currentMembers.length === 0 ? (
          <div className="bg-zinc-50 border border-dashed border-zinc-300 p-8 text-center">
            <p className="text-sm text-zinc-500">You are currently working solo.</p>
            <p className="text-xs text-zinc-400 mt-1">Search below to add teammates, or continue solo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMembers.map(m => (
              <div key={m.userId} className="flex items-center justify-between bg-white border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold uppercase">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{m.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(m.userId)}
                  disabled={isUpdating}
                  className="text-red-500 hover:text-red-700 p-2 transition-colors disabled:opacity-50"
                  title="Remove Teammate"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Teammates */}
      {!isFull && (
        <div className="bg-white border border-zinc-200 p-6 md:p-8">
          <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-4">Invite Teammates</h3>
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? <Loader2 size={16} className="text-zinc-400 animate-spin" /> : <Search size={16} className="text-zinc-400" />}
            </div>
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              className="w-full bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#1a3a5c] transition-colors placeholder:text-zinc-400"
              placeholder="Search by name, github handle, or university..."
            />
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map(r => {
                const alreadyAdded = currentMembers.some(m => m.userId === r.userId);
                return (
                  <div key={r.userId} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center text-[#1a3a5c] font-medium text-lg">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900">{r.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{r.githubUrl?.replace("https://github.com/", "") || "No Github"} · {r.country || "Global"}</div>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 py-1 bg-zinc-100">Added</span>
                    ) : (
                      <button
                        onClick={() => handleAdd(r.userId, r.name)}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isFull && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm text-center">
          You have reached the maximum team size for this challenge.
        </div>
      )}

      <div className="pt-8 border-t border-zinc-200 flex items-center justify-between">
        <p className="text-xs text-zinc-500 max-w-sm">
          You can proceed to submit your solution now. You can return to this page later if you need to adjust your team before final submission.
        </p>
        <Link 
          href={`/problems/${problemId}/submit`}
          className="btn-primary px-8 py-3 text-sm font-medium flex items-center gap-2"
        >
          Proceed to Solution Submission <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
