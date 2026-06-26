import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (!role) redirect("/onboarding");
  if (role === "student") redirect("/dashboard/student");
  if (role === "organization" || role === "company") {
    const orgId = user?.publicMetadata?.orgId;
    if (orgId) {
      redirect(`/organizations/${orgId}/dashboard`);
    } else if (role === "company") {
      redirect("/dashboard/company");
    } else {
      redirect("/onboarding/organization");
    }
  }

  redirect("/onboarding");
}
