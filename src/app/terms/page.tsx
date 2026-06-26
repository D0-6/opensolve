import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-32 px-6">
      <div className="w-full max-w-[125rem] mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="border-b border-zinc-200 pb-12">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 text-[#1a3a5c] flex items-center justify-center mb-8">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium text-zinc-900 tracking-tight mb-6">Terms of Service</h1>
          <p className="text-zinc-500 text-base">Last Updated: October 2024</p>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-zinc-600 text-base leading-relaxed">
          
          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using OpenSolve, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the platform. These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">2. Account Registration and Security</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">3. Challenge Postings and Awards</h2>
            <p>
              OpenSolve aggregates both verified and publicly sourced (unverified) challenges. Verified challenges are posted directly by organizations. For unverified challenges, we make no guarantee regarding the availability, validity, or payout of the stated rewards. Any contractual relationship resulting from a challenge is strictly between the solver and the posting organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">4. Intellectual Property</h2>
            <p>
              Unless otherwise specified by a challenge&apos;s specific rules, you retain ownership of the code you submit. By submitting a solution, you grant OpenSolve a non-exclusive license to display, host, and share your submission with the relevant organizations for evaluation purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">5. Disclaimer of Warranties and Limitation of Liability</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. OpenSolve makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content, or materials included therein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-zinc-900 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
