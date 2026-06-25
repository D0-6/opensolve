import { FileText } from "lucide-react";
import Link from "next/link";

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto mt-12 mb-32 px-6">
      <div className="glass-panel p-8 md:p-12 rounded-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-display-lg text-on-surface">Terms of Service</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-on-surface-variant font-body-md space-y-8">
          <p className="text-sm border-b border-white/10 pb-4"><strong>Effective Date:</strong> June 25, 2026</p>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the OpenSolve platform ("Platform"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Platform. OpenSolve is a platform facilitating connections between developers ("Solvers") and organizations ("Posters") for the purpose of solving technical challenges.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">2. Account Registration and Security</h2>
            <p className="mb-4">
              To use certain features of the Platform, you must register for an account using a valid email address or third-party provider (e.g., Google, GitHub). You agree to provide accurate, current, and complete information during the registration process.
            </p>
            <p>
              You are entirely responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these Terms or present a security risk.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">3. Challenge Postings and Awards</h2>
            <p className="mb-4">
              <strong>For Organizations (Posters):</strong> By posting a challenge, you commit to evaluating submissions in good faith. You are solely responsible for determining the winner(s) and distributing any promised rewards (cash, contracts, hiring offers). OpenSolve does not hold funds in escrow and is not liable for unpaid prizes.
            </p>
            <p className="mb-4">
              <strong>For Developers (Solvers):</strong> By submitting a solution, you warrant that your submission is your original work and does not infringe on any third-party intellectual property rights. You understand that the posting Organization retains sole discretion over selecting winners.
            </p>
            <p>
              <strong>Aggregated Content:</strong> Some challenges on OpenSolve are aggregated from public sources and have not been explicitly verified by the original organization. These are marked without a "Verified" badge. We make no guarantees regarding the validity, uptime, or reward status of aggregated challenges.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              <strong>Platform IP:</strong> The OpenSolve platform, including its code, design, and architecture, is owned by OpenSolve. You may not copy, modify, or distribute our intellectual property without written consent.
            </p>
            <p>
              <strong>User Submissions:</strong> Unless explicitly stated otherwise in the specific rules of a challenge, you retain the intellectual property rights to the code you submit. However, by submitting a solution, you grant the posting Organization a limited license to review and evaluate your code for the purpose of the challenge.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">5. Disclaimer of Warranties and Limitation of Liability</h2>
            <p className="mb-4">
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. OPENSOLVE EXPRESSLY DISCLAIMS ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p>
              IN NO EVENT SHALL OPENSOLVE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM OR INABILITY TO SECURE A REWARD OR EMPLOYMENT.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on the Platform or via email. Your continued use of the Platform after changes constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p>If you have any questions about these Terms, please <Link href="#" className="text-primary hover:underline">contact us</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
