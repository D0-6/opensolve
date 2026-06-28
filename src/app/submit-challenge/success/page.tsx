import Link from "next/link";
import { CheckCircle2, Trophy, ArrowRight } from "lucide-react";

export default function SubmitChallengeSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto mb-6 text-3xl">
          🕵️
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle2 size={22} className="text-green-500" />
          <h1 className="text-2xl font-medium text-zinc-900">Challenge Submitted!</h1>
        </div>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Your challenge has been submitted for review. Once approved, it will appear on OpenSolve with your name as the discoverer — and you'll earn <strong className="text-zinc-900">100 Scout Points</strong>.
        </p>
        <div className="bg-purple-50 border border-purple-100 p-5 mb-8 text-left space-y-3">
          <div className="flex items-start gap-2 text-sm text-purple-800">
            <Trophy size={16} className="shrink-0 mt-0.5 text-purple-600" />
            <span>Your Scout Points will appear on your <strong>public profile</strong> immediately after approval.</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-purple-800">
            <span className="text-purple-600 mt-0.5 shrink-0">💰</span>
            <span>If someone wins prize money from your challenge, you automatically receive <strong>5% as a finder's fee</strong>.</span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/challenges" className="btn-primary py-3 px-6 flex items-center justify-center gap-2">
            Browse All Challenges <ArrowRight size={16} />
          </Link>
          <Link href="/leaderboard?tab=scouts" className="btn-secondary py-3 px-6">
            View Top Scouts Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
