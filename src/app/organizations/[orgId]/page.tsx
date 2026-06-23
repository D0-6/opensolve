import { getOrganization } from "@/lib/data";
import { notFound } from "next/navigation";
import { Building, Globe, BadgeCheck, Mail } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrganizationProfile({ params }: { params: { orgId: string } }) {
  const org = await getOrganization(params.orgId);

  if (!org) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 space-y-8">
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
        {org.logoUrl ? (
          <img src={org.logoUrl} alt={org.orgName} className="w-24 h-24 rounded-2xl object-cover z-10 bg-white" />
        ) : (
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center z-10">
            <Building className="w-10 h-10 text-slate-400" />
          </div>
        )}
        
        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-3xl font-bold">{org.orgName}</h1>
            {org.verified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {org.orgType.replace("_", " ")}
            </div>
            {org.website && (
              <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> {org.contactEmail}
            </div>
          </div>
        </div>

        <div className="z-10 mt-4 md:mt-0 flex flex-col gap-2">
          <Link href={`/organizations/${org.orgId}/dashboard`} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors text-center">
            Org Dashboard
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Posted Problems</h2>
        <div className="glass-panel p-8 rounded-xl text-center text-slate-500">
          Fetching problems for this organization is simplified for the hackathon. 
          See the <Link href="/" className="text-blue-500 hover:underline">homepage feed</Link> instead.
        </div>
      </div>
    </div>
  );
}
