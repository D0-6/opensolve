import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

/**
 * /dashboard/company is deprecated.
 * Both "company" and "organization" role users now route through
 * /organizations/[orgId]/dashboard.
 * This page exists only for backwards compatibility.
 */
export default async function CompanyDashboardRedirect() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const orgId = user.publicMetadata?.orgId as string | undefined;

  if (orgId) {
    redirect(`/organizations/${orgId}/dashboard`);
  }

  // They have a company role but no orgId — they need to complete org onboarding
  redirect("/onboarding/organization");
}
