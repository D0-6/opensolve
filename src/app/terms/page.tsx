export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto mt-12 space-y-8 glass-panel p-8 md:p-12 rounded-3xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-slate-500 mb-8">Last Updated: June 2026</p>

        <h3>1. Hackathon Project Nature</h3>
        <p>
          OpenSolve is currently a functional prototype built for the AWS + Vercel Hackathon. All data, functionality, and uptime is provided "as is" and "as available". We reserve the right to wipe the database, modify features, or shut down the platform entirely without notice.
        </p>

        <h3>2. Liability</h3>
        <p>
          We are not liable for any lost work, unfulfilled contracts, or unawarded prizes. We are a platform that facilitates connections. The fulfillment of any prize, contract, or hiring offer is entirely between the posting organization and the submitting developer.
        </p>

        <h3>3. Accuracy of Aggregated Content</h3>
        <p>
          Problems that are <strong>not verified</strong> (lacking the blue checkmark) have been aggregated from public sources. While we strive for accuracy, we cannot guarantee that the problem is still active, that the prize amount is accurate, or that the original source will accept submissions originating from OpenSolve.
        </p>

        <h3>4. Intellectual Property</h3>
        <p>
          By submitting a GitHub repository URL, you claim that you have the right to share that code publicly. OpenSolve does not claim ownership over any code you write. The terms of ownership for solutions depend on the specific rules of the problem you are solving (e.g., whether the organization requires assigning IP rights in exchange for the prize). Please refer to the original source URL for full legal terms of the problem.
        </p>
      </div>
    </div>
  );
}
