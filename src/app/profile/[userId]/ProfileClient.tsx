"use client";

import { useState } from "react";
import { GitBranch, Trophy, Calendar, Pencil, X, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { updateProfile } from "./actions";

export default function ProfileClient({ 
  isOwner, 
  profile, 
  submissions,
  userId
}: { 
  isOwner: boolean; 
  profile: any; 
  submissions: any[];
  userId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateProfile(formData);
    setIsEditing(false);
    setLoading(false);
  };

  const inputStyles = "w-full bg-white border border-zinc-300 px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm font-medium";

  return (
    <div className="w-full max-w-[125rem] mx-auto mt-12 space-y-8 px-6">
      {/* Profile Header */}
      <div className="bg-white border border-zinc-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative">
        {isOwner && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-[#1a3a5c] transition-colors bg-white border border-zinc-200 p-2 hover:bg-zinc-50"
            title="Edit Profile"
          >
            <Pencil size={18} />
          </button>
        )}

        <div className="w-32 h-32 bg-zinc-100 border border-zinc-200 flex-shrink-0 flex items-center justify-center text-[#1a3a5c] text-5xl font-medium">
          {profile?.name ? profile.name.charAt(0).toUpperCase() : userId.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 text-center md:text-left w-full">
          <h1 className="text-3xl font-medium text-zinc-900 mb-2 tracking-tight">{profile?.name || `User ${userId}`}</h1>
          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4 w-full mt-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Bio</label>
                <textarea 
                  name="bio" 
                  defaultValue={profile?.bio || ""} 
                  className={`${inputStyles} resize-none`} 
                  rows={3} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">GitHub Username</label>
                  <input 
                    name="githubUsername" 
                    type="text" 
                    defaultValue={profile?.githubUsername || ""} 
                    className={inputStyles} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Skills (comma separated)</label>
                  <input 
                    name="skills" 
                    type="text" 
                    defaultValue={profile?.skills?.join(", ") || ""} 
                    className={inputStyles} 
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1a3a5c] hover:bg-[#112740] transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-zinc-600 mb-4 max-w-xl text-sm leading-relaxed">
                {profile?.bio || "A brilliant problem solver working on exciting challenges."}
              </p>
              
              {profile?.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-2 py-1 uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                  <Trophy className="w-4 h-4 text-[#1a3a5c]" />
                  {profile?.totalScore || 0} Score
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  Joined {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : "Recently"}
                </div>
                {profile?.githubUsername && (
                  <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:border-[#1a3a5c] transition-colors uppercase tracking-wider group">
                    <GitBranch className="w-4 h-4 text-zinc-400 group-hover:text-[#1a3a5c]" />
                    GitHub
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submissions History */}
      <div>
        <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-2">Submission History</h2>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-500 text-sm">
              No submissions yet.
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={`${sub.problemId}-${sub.submittedAt}`} className="bg-white border border-zinc-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#1a3a5c] transition-colors">
                <div>
                  <Link href={`/problems/${sub.problemId}`} className="text-lg font-medium text-zinc-900 hover:text-[#1a3a5c] transition-colors">
                    View Problem
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-2 bg-zinc-50 border border-zinc-200">
                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Score</div>
                    <div className="font-medium text-lg text-zinc-900">{sub.score}</div>
                  </div>
                  <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="p-3 bg-white border border-zinc-200 text-zinc-400 hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-colors">
                    <GitBranch className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
