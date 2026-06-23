import { Zap } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-8 glass-panel p-8 md:p-12 rounded-3xl">
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
          <Zap className="w-8 h-8" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-center mb-8">About OpenSolve</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg leading-relaxed">
          The core insight behind OpenSolve is simple: <strong>AI gives us problem statements, but humans (and human-guided AI) build the full pipeline to solve them.</strong>
        </p>

        <p>
          OpenSolve aggregates real funded problems from YC Requests for Startups, government innovation challenges, and industry-posted problems. We provide a transparent, verifiable pipeline where students and developers can submit public solutions. Organizations can view ranked submissions, evaluate the actual code via GitHub, and contact top performers for hiring, contracts, or prize payouts.
        </p>

        <h3>Verified vs. Aggregated Problems</h3>
        <p>
          You will notice a blue checkmark (<span className="inline-block text-blue-500 font-bold">✓</span>) next to some organizations and problems. This indicates that the organization has explicitly opted in and claimed their listing on our platform. 
        </p>
        <p>
          Listings without a checkmark are <strong>aggregated</strong>—we have publicly curated them from valid sources, but the organization has not yet officially partnered with OpenSolve. In these cases, the stated prize/contract amounts are reported directly from the original sources for informational purposes.
        </p>

        <h3>Why the Hackathon Model Works</h3>
        <p>
          By creating a lightweight Q&A layer alongside the problem description, we enable asynchronous mentorship. Developers get the help they need while solving, and organizations get better solutions.
        </p>
      </div>
    </div>
  );
}
