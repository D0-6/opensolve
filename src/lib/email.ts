import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string | string[];
  subject: string;
  body: string;
}) {
  const recipient = Array.isArray(to) ? to.join(", ") : to;

  if (resend) {
    try {
      await resend.emails.send({
        from: "OpenSolve <no-reply@opensolve.com>",
        to,
        subject,
        text: body,
      });
      return true;
    } catch (error) {
      console.error("Resend Email Error:", error);
      return false;
    }
  }

  // Fallback: Format a beautiful terminal output to simulate email delivery in dev
  console.log("\n\x1b[36m" + "=".repeat(60) + "\x1b[0m");
  console.log(`\x1b[1m\x1b[32m📧 NEW AUTOMATED EMAIL DISPATCHED (DEV MODE)\x1b[0m`);
  console.log(`\x1b[33mTo:\x1b[0m      ${recipient}`);
  console.log(`\x1b[33mSubject:\x1b[0m ${subject}`);
  console.log("\x1b[36m" + "-".repeat(60) + "\x1b[0m");
  console.log(`\x1b[37m${body}\x1b[0m`);
  console.log("\x1b[36m" + "=".repeat(60) + "\x1b[0m\n");

  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
}
