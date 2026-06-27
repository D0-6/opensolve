import { getProblems, type Problem } from "@/lib/data";
import ChallengesClient from "./ChallengesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Challenges | OpenSolve",
  description: "Search and filter open challenges from startups, government bodies, and top companies.",
};

export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ source?: string; domain?: string }> }) {
  const sp = await searchParams;
  const problemsRes = await getProblems(sp.source, sp.domain);
  const problems = problemsRes.items;
  
  // Sort primarily by active status, then by soonest deadline
  const allDomains = Array.from(new Set(problems.map((p: Problem) => p.domain))).filter(Boolean).sort();

  return <ChallengesClient problems={problems} allDomains={allDomains} />;
}
