import { ShieldAlert } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-32 px-6">
      <div className="w-full max-w-[125rem] mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="border-b border-white/10 pb-12">
          <div className="w-16 h-16 bg-transparent/5 border border-white/10 text-[#1a3a5c] flex items-center justify-center mb-8">
            <ShieldAlert size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-6">Privacy Policy</h1>
          <p className="text-zinc-400 text-base">Last Updated: October 2024</p>
        </div>

        {/* Content Body */}
        <div className="space-y-12 text-zinc-400 text-base leading-relaxed">
          
          <section>
            <h2 className="text-xl font-medium text-white mb-4">1. Introduction</h2>
            <p>
              OpenSolve values your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our platform. By using the Service, you consent to the data practices described in this statement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, update your profile, post a challenge, or submit a solution. This includes personal identifiers like your name, email address, GitHub username, and any other information you choose to provide in your public bio or resume.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">3. Use of Your Information</h2>
            <p>
              We use the information we collect to operate, maintain, and improve our platform. This includes facilitating connections between problem solvers and organizations, verifying account identities, providing customer support, and sending you updates or notifications related to your account and platform activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">4. Disclosure of Your Information</h2>
            <p>
              When you submit a solution or create a public profile, your name, GitHub link, and submitted code references are visible to organizations and other users. We do not sell your personal data to third parties. We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with legal obligations or protect the rights and safety of OpenSolve and our users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">5. Data Security and Retention</h2>
            <p>
              We implement reasonable security measures designed to protect your information from unauthorized access, alteration, or disclosure. We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-white mb-4">6. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, or delete the personal information we hold about you. If you wish to exercise these rights or have any questions about this Privacy Policy, please contact our support team.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
