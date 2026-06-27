import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  // No role assigned yet — send to the routing page that will direct them
  // to role-selection or their appropriate onboarding step. This route is now
  // accessible even with the onboarding_complete cookie.
  if (!role) redirect("/onboarding/routing");

  if (role === "student") redirect("/dashboard/student");

  if (role === "organization" || role === "company") {
    const orgId = user?.publicMetadata?.orgId as string | undefined;
    if (orgId) {
      redirect(`/organizations/${orgId}/dashboard`);
    } else if (role === "company") {
      redirect("/dashboard/company");
    } else {
      // organization role but no orgId — they need to finish org onboarding
      redirect("/onboarding/organization");
    }
  }

  // Unknown role — send to routing to re-classify
  redirect("/onboarding/routing");
}
