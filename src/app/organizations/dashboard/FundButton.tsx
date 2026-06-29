"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export default function FundButton({ problemId }: { problemId: string }) {
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFund}
      disabled={loading}
      className="btn-primary px-5 py-2.5 flex items-center gap-2 font-medium"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
      {loading ? "Redirecting..." : "Fund Prize to Unlock Submissions"}
    </button>
  );
}
