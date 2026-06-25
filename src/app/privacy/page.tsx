import { Shield } from "lucide-react";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto mt-12 mb-32 px-6">
      <div className="glass-panel p-8 md:p-12 rounded-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-display-lg text-on-surface">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-on-surface-variant font-body-md space-y-8">
          <p className="text-sm border-b border-white/10 pb-4"><strong>Effective Date:</strong> June 25, 2026</p>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">1. Introduction</h2>
            <p>
              OpenSolve ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our platform. Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">2. Information We Collect</h2>
            <p className="mb-4">
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
              <li><strong>Third-Party Data:</strong> Information from third parties, such as GitHub or Google, if you choose to link, create, or log in to your account with these services.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">3. Use of Your Information</h2>
            <p className="mb-4">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your account.</li>
              <li>Facilitate the submission of challenge solutions and connect you with posting organizations.</li>
              <li>Email you regarding your account, challenge updates, or platform changes.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">4. Disclosure of Your Information</h2>
            <p className="mb-4">
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <p className="mb-4">
              <strong>To Challenge Posters:</strong> If you submit a solution to a challenge, your profile information, GitHub URL, and write-up will be shared with the organization that posted the challenge so they may evaluate your work and contact you.
            </p>
            <p>
              <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">5. Data Security and Retention</h2>
            <p className="mb-4">
              We use administrative, technical, and physical security measures to help protect your personal information, including end-to-end encryption and secure cloud infrastructure hosted on AWS. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-headline-md text-on-surface mb-4">6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing. If you wish to exercise any of these rights, please contact us.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <p>If you have any questions about this Privacy Policy, please <Link href="#" className="text-primary hover:underline">contact us</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
