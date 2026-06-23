export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-8 glass-panel p-8 md:p-12 rounded-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-slate-500 mb-8">Last Updated: June 2026</p>

        <h3>1. What data we collect</h3>
        <p>
          We collect your name, email address, GitHub URL, and the text writeup you provide when submitting a solution. For organizations, we collect organization names, contact emails, and website URLs.
        </p>

        <h3>2. Authentication & Security</h3>
        <p>
          <strong>OpenSolve does not currently use a full password-based or session-based authentication system.</strong> We use a lightweight claim-link mechanism (magic links). When you request to edit your profile, we generate a token, securely hash it, and email it to you. We never store the raw tokens.
        </p>
        <p>
          Your emails are masked in all public-facing views and API responses. Only the owning user or organization can see their own full email address. All data stored in AWS DynamoDB is encrypted at rest automatically by AWS, and transmitted securely over HTTPS via Vercel.
        </p>

        <h3>3. GitHub URLs</h3>
        <p>
          GitHub URLs are stored as submitted. We do not independently verify that the submitted GitHub URL belongs to the person submitting it. Please use your best judgment.
        </p>

        <h3>4. Hackathon Prototype Notice</h3>
        <p>
          This application is a prototype built for the AWS + Vercel Hackathon. All data collected is for demonstration and evaluation purposes. We make no guarantees about the long-term retention of this data.
        </p>

        <h3>5. Deletion Requests</h3>
        <p>
          If you wish to have your data removed from this prototype, please contact us at <code>privacy@opensolve.demo</code>.
        </p>
      </div>
    </div>
  );
}
