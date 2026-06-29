"use client";

import { useState } from "react";
import { completeOnboardingAction } from "./_actions";

export default function OnboardingForm() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accepted) {
      setLoading(true);
      completeOnboardingAction().catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex items-start gap-3 p-4 border border-zinc-200 rounded-sm bg-white cursor-pointer hover:bg-zinc-50 transition-colors">
        <input 
          type="checkbox" 
          required 
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 w-5 h-5 text-[#1a3a5c] border-zinc-300 focus:ring-[#1a3a5c] rounded-sm"
        />
        <span className="text-sm text-zinc-700 font-medium leading-relaxed">
          I confirm that I have read and agree to the OpenSolve Terms of Service and Privacy Policy. I agree that any platform funds are subject to the 99.5% payout and 0.5% platform fee structure.
        </span>
      </label>

      <button
        type="submit"
        disabled={!accepted || loading}
        className="w-full btn-primary font-medium text-lg py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Completing Setup..." : "I Accept the Terms"}
      </button>
    </form>
  );
}
