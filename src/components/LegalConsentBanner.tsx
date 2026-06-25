"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LegalConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("opensolve_legal_accepted");
    if (!accepted) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 fade-in-up">
      <div className="max-w-5xl mx-auto bg-[#0c1324] border border-white/10 p-6 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed">
          OpenSolve uses cookies and local storage to keep your session secure and improve your experience. By continuing to use this platform or creating an account, you acknowledge that you have read and agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
        <button
          onClick={() => {
            localStorage.setItem("opensolve_legal_accepted", "true");
            setShow(false);
          }}
          className="bg-[#00cbe6] hover:bg-[#5de6ff] text-[#001f25] px-8 py-3 rounded-xl whitespace-nowrap font-bold transition-colors"
        >
          I Accept
        </button>
      </div>
    </div>
  );
}
