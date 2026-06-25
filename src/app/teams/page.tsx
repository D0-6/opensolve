"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Users, Copy, Plus, LogIn, Loader2, ShieldCheck, Check, AlertCircle } from "lucide-react";

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
    return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-[#00cbe6]" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] py-24 px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-[#a078ff]/10 border border-[#a078ff]/20 rounded-full px-3 py-1 text-xs font-semibold text-[#a078ff] mb-4">
            <Users size={14} /> Collaboration Hub
          </div>
          <h1 className="text-4xl font-display-lg text-[#dce1fb] font-bold mb-4">Squad Up.</h1>
          <p className="text-[#8990a8] font-body-md text-lg">Form a team of up to 4 builders to tackle enterprise challenges together. Teams have a higher success rate of securing contracts.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {team ? (
          <div className="bg-[#0c1324] border border-[#00cbe6]/30 shadow-[0_0_40px_rgba(0,203,230,0.05)] rounded-3xl p-8 md:p-12">
            <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#dce1fb]">{team.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-[#00cbe6] text-sm font-bold">
                  <ShieldCheck size={16} /> Verified Active Team
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#8990a8] mb-2 uppercase tracking-wider font-bold">Members</p>
                <p className="text-3xl font-bold text-[#dce1fb]">{team.members.length} <span className="text-[#8990a8] text-xl">/ 4</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-bold text-[#dce1fb] mb-4">Invite Code</h3>
                <p className="text-sm text-[#8990a8] mb-4">Share this secure code with up to 3 friends to have them join your squad.</p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-[#020617] border border-white/10 p-4 rounded-xl text-[#00cbe6] font-mono text-sm break-all">
                    {team.teamId}
                  </code>
                  <button onClick={copyToClipboard} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors text-[#dce1fb]">
                    {copied ? <Check size={20} className="text-[#00cbe6]" /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#dce1fb] mb-4">Team Security</h3>
                <ul className="space-y-3 text-sm text-[#8990a8]">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#00cbe6] shrink-0" /> End-to-end verified submissions.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#00cbe6] shrink-0" /> Enterprise organizations can hire the whole team.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#00cbe6] shrink-0" /> Prize pools are distributed equally.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Team */}
            <div className="bg-[#0c1324] border border-white/10 rounded-3xl p-8 hover:border-[#00cbe6]/50 transition-colors group">
              <div className="w-14 h-14 bg-[#00cbe6]/10 text-[#00cbe6] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#dce1fb] mb-3">Start a Squad</h2>
              <p className="text-[#8990a8] text-sm mb-8">Create a new team, generate an invite code, and recruit up to 3 other builders.</p>
              <button 
                onClick={handleCreateTeam} 
                disabled={actionLoading}
                className="w-full bg-white/5 border border-white/10 text-[#dce1fb] font-bold py-3 rounded-xl hover:bg-[#00cbe6] hover:text-[#020617] transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : "Initialize Team"}
              </button>
            </div>

            {/* Join Team */}
            <div className="bg-[#0c1324] border border-white/10 rounded-3xl p-8">
              <div className="w-14 h-14 bg-[#a078ff]/10 text-[#a078ff] rounded-2xl flex items-center justify-center mb-6">
                <LogIn size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#dce1fb] mb-3">Join a Squad</h2>
              <p className="text-[#8990a8] text-sm mb-6">Have an invite code from a friend? Paste it below to join their roster.</p>
              
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <input 
                  required
                  type="text" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste Invite Code" 
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 text-[#dce1fb] placeholder:text-[#8990a8] focus:outline-none focus:ring-2 focus:ring-[#a078ff]/50 font-mono text-sm"
                />
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-[#a078ff] text-white font-bold py-3 rounded-xl hover:bg-[#b08cff] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(160,120,255,0.2)]"
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
