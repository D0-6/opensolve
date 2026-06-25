/**
 * Email Infrastructure Simulator
 * Since we don't have a paid email provider yet, this service intercepts
 * all email requests and logs them beautifully to the server console.
 * 
 * When you are ready to upgrade, simply replace this file with the Resend SDK.
 */

export async function sendMockEmail({
  to,
  subject,
  body,
}: {
  to: string | string[];
  subject: string;
  body: string;
}) {
  const recipient = Array.isArray(to) ? to.join(", ") : to;

  // Format a beautiful terminal output to simulate email delivery
  console.log("\n\x1b[36m" + "=".repeat(60) + "\x1b[0m");
  console.log(`\x1b[1m\x1b[32m📧 NEW AUTOMATED EMAIL DISPATCHED\x1b[0m`);
  console.log(`\x1b[33mTo:\x1b[0m      ${recipient}`);
  console.log(`\x1b[33mSubject:\x1b[0m ${subject}`);
  console.log("\x1b[36m" + "-".repeat(60) + "\x1b[0m");
  console.log(`\x1b[37m${body}\x1b[0m`);
  console.log("\x1b[36m" + "=".repeat(60) + "\x1b[0m\n");

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  return true;
}
