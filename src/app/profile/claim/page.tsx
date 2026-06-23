"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";

function ClaimForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const urlUserId = searchParams.get("userId");

  const [userId, setUserId] = useState(urlUserId || "");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(token ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile/claim-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("Claim link sent! (Check the server console, mock email printed there)");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile/claim-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("Profile claimed successfully! You now have edit access (mock session).");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 glass-panel p-8 rounded-3xl text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
        {step === 1 ? <Mail className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
      </div>
      <h1 className="text-2xl font-bold mb-2">Claim Your Profile</h1>
      <p className="text-sm text-slate-500 mb-8">
        {step === 1 
          ? "Enter your User ID and email to receive a magic link to claim ownership of your submissions." 
          : "Click below to verify your magic link and claim your profile."}
      </p>

      {message && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm">{message}</div>}
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequest} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input required type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Verifying..." : "Verify & Claim"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <ClaimForm />
    </Suspense>
  );
}
