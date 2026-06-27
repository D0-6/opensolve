import { getProblems, type Problem } from "@/lib/data";
import ChallengesClient from "./ChallengesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Challenges | OpenSolve",
  description: "Search and filter open challenges from startups, government bodies, and top companies.",
};

export default async function ChallengesPage() {
  // Fetch all open problems
  const problems = await getProblems();

  // Extract unique domains for the filter dropdown
  const allDomains = Array.from(new Set(problems.map((p: Problem) => p.domain))).filter(Boolean).sort();

  return <ChallengesClient problems={problems} allDomains={allDomains} />;
}
