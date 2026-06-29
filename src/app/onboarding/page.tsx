import { currentUser } from "@clerk/nextjs/server";
import { setOnboardingCookieOnly, completeOnboardingAction } from "./_actions";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const user = await currentUser();

  // If the user somehow reached this page without being logged in
  if (!user) {
    return null; 
  }

  // Cross-device sync: If Clerk already knows they accepted terms, but the device is new
  if (user.publicMetadata?.onboardingComplete) {
    await setOnboardingCookieOnly();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
      <div className="max-w-2xl w-full bg-white border border-zinc-200 p-8 md:p-12 fade-in-up">
        
        <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mb-8">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-medium tracking-tight text-zinc-900 mb-4">
          Welcome to OpenSolve
        </h1>
        
        <p className="text-lg text-zinc-600 leading-relaxed mb-8">
          To maintain the security and integrity of our platform, all users must agree to our Terms of Service and Privacy Policy before accessing challenges, posting problems, or contacting other members.
        </p>

        <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8">
          <h3 className="font-semibold text-zinc-900 mb-3">By agreeing to the terms, you acknowledge that:</h3>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 text-sm">
            <li>You have read and agree to the <Link href="/terms" target="_blank" className="text-zinc-900 font-medium hover:underline">Terms of Service</Link>.</li>
            <li>You have read and agree to the <Link href="/privacy" target="_blank" className="text-zinc-900 font-medium hover:underline">Privacy Policy</Link>.</li>
            <li>You will submit only original work and respect the intellectual property of others.</li>
            <li>You understand that OpenSolve is a platform facilitating connections, and reward fulfillment is handled strictly between the poster and the solver.</li>
          </ul>
        </div>

        <OnboardingForm />
      </div>
    </div>
  );
}
