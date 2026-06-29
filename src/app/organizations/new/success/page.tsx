import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChallengeSuccessPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const orgId = (sessionClaims?.publicMetadata as Record<string, string> | undefined)?.orgId;
  const dashboardLink = orgId ? `/organizations/${orgId}/dashboard` : "/";

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-medium text-white mb-4 tracking-tight">Challenge Published!</h1>
        <p className="text-zinc-400 text-base leading-relaxed mb-10">
          Your challenge is now live in the OpenSolve directory and our builder network has been notified. 
          You will receive an email as soon as the first solutions are submitted.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/challenges" className="btn-primary py-3.5 w-full flex justify-center items-center gap-2">
            View in Directory <ArrowRight size={18} />
          </Link>
          <Link href={dashboardLink} className="btn-secondary py-3.5 w-full">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
