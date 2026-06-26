"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Users, Copy, Plus, LogIn, Loader2, ShieldCheck, Check, AlertCircle, CheckCircle2 } from "lucide-react";

export default function TeamsPage() {
  const { user } = useUser();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.team) setTeam(data.team);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateTeam = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${user?.firstName || 'Builder'}'s Team` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeam(data.team);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: inviteCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchTeam();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(team.teamId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="w-full max-w-[125rem] mx-auto">
        
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 mb-6 uppercase tracking-wide">
            <Users size={14} /> Collaboration Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-zinc-900 leading-tight tracking-tight mb-3">
            Squad Up.
          </h1>
          <p className="text-base text-zinc-500">
            Form a team of up to 4 builders to tackle enterprise challenges together. Teams have a higher success rate of securing contracts.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-[#1a3a5c]/10 border border-[#1a3a5c]/20 text-[#1a3a5c] p-4 mb-8 text-sm font-medium">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {team ? (
          <div className="bg-white border border-zinc-200 p-6 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 pb-8 mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-zinc-900">{team.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-[#1a3a5c] text-sm font-bold">
                  <ShieldCheck size={16} /> Verified Active Team
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Members</p>
                <p className="text-3xl font-medium text-zinc-900">{team.members.length} <span className="text-zinc-400 text-xl">/ 4</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Invite Code</h3>
                <p className="text-sm text-zinc-500 mb-4">Share this secure code with up to 3 friends to have them join your squad.</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 text-zinc-900 font-mono text-sm break-all">
                    {team.teamId}
                  </code>
                  <button onClick={copyToClipboard} className="bg-white border border-zinc-200 p-3 hover:bg-zinc-50 transition-colors text-zinc-600">
                    {copied ? <Check size={20} className="text-[#1a3a5c]" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Team Security</h3>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#1a3a5c] shrink-0" /> End-to-end verified submissions.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#1a3a5c] shrink-0" /> Enterprise organizations can hire the whole team.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#1a3a5c] shrink-0" /> Prize pools are distributed equally.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Team */}
            <div className="bg-white border border-zinc-200 p-8 hover:bg-zinc-50 transition-colors group">
              <div className="w-12 h-12 bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center mb-6 group-hover:text-[#1a3a5c] group-hover:border-[#1a3a5c] transition-colors">
                <Plus size={20} />
              </div>
              <h2 className="text-xl font-medium text-zinc-900 mb-2">Start a Squad</h2>
              <p className="text-zinc-500 text-sm mb-8">Create a new team, generate an invite code, and recruit up to 3 other builders.</p>
              <button 
                onClick={handleCreateTeam} 
                disabled={actionLoading}
                className="w-full bg-white border border-zinc-200 text-zinc-900 font-medium py-3 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Initialize Team"}
              </button>
            </div>

            {/* Join Team */}
            <div className="bg-white border border-zinc-200 p-8">
              <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 text-zinc-600 flex items-center justify-center mb-6">
                <LogIn size={20} />
              </div>
              <h2 className="text-xl font-medium text-zinc-900 mb-2">Join a Squad</h2>
              <p className="text-zinc-500 text-sm mb-6">Have an invite code from a friend? Paste it below to join their roster.</p>
              
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <input 
                  required
                  type="text" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste Invite Code" 
                  className="w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors font-mono text-sm"
                />
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full btn-primary font-medium py-3 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Join"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
