import { Zap, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-32 px-6">
      <div className="max-w-[1250px] mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="border-b border-zinc-200 pb-12">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 text-[#1a3a5c] flex items-center justify-center mb-8">
            <Zap size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-medium text-zinc-900 tracking-tight mb-6">
            About OpenSolve
          </h1>
          
          <p className="text-xl leading-relaxed text-zinc-900 font-medium max-w-3xl">
            The core insight behind OpenSolve is simple: AI gives us problem statements, but humans (and human-guided AI) build the full pipeline to solve them.
          </p>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Mission */}
          <div className="space-y-6 text-zinc-600 text-base leading-relaxed">
            <p>
              OpenSolve aggregates real funded problems from YC Requests for Startups, government innovation challenges, and industry-posted problems. We provide a transparent, verifiable pipeline where students and developers can submit public solutions. 
            </p>
            <p>
              Organizations can view ranked submissions, evaluate the actual code via GitHub, and contact top performers for hiring, contracts, or prize payouts. By bringing both sides together in a public forum, we ensure that hard work is recognized and tangible solutions reach the people who need them.
            </p>
          </div>

          {/* Right Column: Key Distinctions */}
          <div className="space-y-12">
            
            {/* Verified vs Aggregated */}
            <div>
              <h3 className="text-xl font-medium text-zinc-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={24} className="text-[#1a3a5c]" strokeWidth={1.5} />
                Verified vs. Aggregated
              </h3>
              <p className="text-zinc-600 text-base leading-relaxed mb-4">
                You will notice a verified badge next to some organizations and problems. This indicates that the organization has explicitly opted in and claimed their listing on our platform. 
              </p>
              <p className="text-zinc-600 text-base leading-relaxed">
                Listings without a badge are <strong>aggregated</strong>—we have publicly curated them from valid sources, but the organization has not yet officially partnered with OpenSolve. In these cases, the stated prize or contract amounts are reported directly from the original sources for informational purposes.
              </p>
            </div>

            {/* Hackathon Model */}
            <div className="pt-8 border-t border-zinc-200">
              <h3 className="text-xl font-medium text-zinc-900 mb-4">
                Why the Hackathon Model Works
              </h3>
              <p className="text-zinc-600 text-base leading-relaxed">
                By creating a lightweight Q&A layer alongside the problem description, we enable asynchronous mentorship. Developers get the help they need while solving, and organizations get better solutions faster.
              </p>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
