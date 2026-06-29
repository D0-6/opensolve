import { getProblems } from "@/lib/data";
import ModerationClient from "./ModerationClient";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const problemsRes = await getProblems();
  const allProblems = problemsRes.items;
  const pendingModeration = allProblems.filter(p => p.source === "COMMUNITY" && !p.verified);
  
  // Sort by newest first
  pendingModeration.sort((a, b) => new Date(b.postedAt || "").getTime() - new Date(a.postedAt || "").getTime());

  return (
    <div className="max-w-6xl">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Moderation Queue</h1>
        <p className="text-zinc-400 mt-1">Review, approve, or delete crowdsourced challenge submissions.</p>
      </div>

      <ModerationClient initialProblems={pendingModeration} />
    </div>
  );
}
