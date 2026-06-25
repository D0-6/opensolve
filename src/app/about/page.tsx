import { Zap } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto mt-12 mb-32 px-6">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-1">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mb-8">
            <Zap className="w-8 h-8" />
          </div>
          
          <h1 className="text-5xl font-display-lg text-on-surface mb-8">About OpenSolve</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-on-surface-variant font-body-lg">
            <p className="text-xl leading-relaxed text-on-surface">
              The core insight behind OpenSolve is simple: <strong>AI gives us problem statements, but humans (and human-guided AI) build the full pipeline to solve them.</strong>
            </p>

            <p>
              OpenSolve aggregates real funded problems from YC Requests for Startups, government innovation challenges, and industry-posted problems. We provide a transparent, verifiable pipeline where students and developers can submit public solutions. Organizations can view ranked submissions, evaluate the actual code via GitHub, and contact top performers for hiring, contracts, or prize payouts.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-8 glass-panel p-8 rounded-3xl">
          <div>
            <h3 className="text-2xl font-headline-md text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verified vs. Aggregated
            </h3>
            <p className="text-on-surface-variant font-body-md leading-relaxed mb-4">
              You will notice a verified badge next to some organizations and problems. This indicates that the organization has explicitly opted in and claimed their listing on our platform. 
            </p>
            <p className="text-on-surface-variant font-body-md leading-relaxed">
              Listings without a badge are <strong>aggregated</strong>—we have publicly curated them from valid sources, but the organization has not yet officially partnered with OpenSolve. In these cases, the stated prize/contract amounts are reported directly from the original sources for informational purposes.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10">
            <h3 className="text-2xl font-headline-md text-on-surface mb-4">Why the Hackathon Model Works</h3>
            <p className="text-on-surface-variant font-body-md leading-relaxed">
              By creating a lightweight Q&A layer alongside the problem description, we enable asynchronous mentorship. Developers get the help they need while solving, and organizations get better solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
