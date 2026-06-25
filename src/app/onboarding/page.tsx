import { currentUser } from "@clerk/nextjs/server";
import { setOnboardingCookieOnly, completeOnboardingAction } from "./_actions";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl fade-in-up">
        
        <div className="w-16 h-16 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mb-8">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-display-lg text-white font-bold mb-4">
          Welcome to OpenSolve
        </h1>
        
        <p className="text-lg text-zinc-400 font-body-md leading-relaxed mb-8">
          To maintain the security and integrity of our platform, all users must agree to our Terms of Service and Privacy Policy before accessing challenges, posting problems, or contacting other members.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-white mb-2">By clicking "I Accept", you acknowledge that:</h3>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-sm font-body-md">
            <li>You have read and agree to the <Link href="/terms" target="_blank" className="text-white hover:underline">Terms of Service</Link>.</li>
            <li>You have read and agree to the <Link href="/privacy" target="_blank" className="text-white hover:underline">Privacy Policy</Link>.</li>
            <li>You will submit only original work and respect the intellectual property of others.</li>
            <li>You understand that OpenSolve is a platform facilitating connections, and reward fulfillment is handled strictly between the poster and the solver.</li>
          </ul>
        </div>

        <form action={completeOnboardingAction}>
          <button
            type="submit"
            className="w-full btn-primary font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-1"
          >
            I Accept the Terms
          </button>
        </form>
      </div>
    </div>
  );
}
