import { getOrganization } from "@/lib/data";
import { notFound } from "next/navigation";
import { Building, Globe, BadgeCheck, Mail } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrganizationProfile({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const org = await getOrganization(orgId);

  if (!org) {
    notFound();
  }

  return (
    <div className="max-w-[1250px] mx-auto mt-12 space-y-8 px-6">
      <div className="bg-white border border-zinc-200 p-8 flex flex-col md:flex-row gap-6 items-center md:items-start relative">
        {org.logoUrl ? (
          <img src={org.logoUrl} alt={org.orgName} className="w-24 h-24 object-cover border border-zinc-200 bg-white" />
        ) : (
          <div className="w-24 h-24 bg-zinc-50 border border-zinc-200 flex items-center justify-center">
            <Building className="w-10 h-10 text-zinc-400" />
          </div>
        )}
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">{org.orgName}</h1>
            {org.verified && <BadgeCheck className="w-6 h-6 text-[#1a3a5c]" />}
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-zinc-600 mt-4 uppercase tracking-wider">
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5">
              {org.orgType.replace("_", " ")}
            </div>
            {org.website && (
              <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:border-[#1a3a5c] transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
            <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5">
              <Mail className="w-4 h-4" /> {org.contactEmail}
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col gap-2">
          <Link href={`/organizations/${org.orgId}/dashboard`} className="px-4 py-2 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-sm font-medium text-zinc-600 transition-colors text-center">
            Org Dashboard
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium text-zinc-900 border-b border-zinc-200 pb-2 mb-6">Posted Problems</h2>
        <div className="bg-zinc-50 border border-zinc-200 p-8 text-center text-zinc-500 text-sm">
          Fetching problems for this organization is simplified for the hackathon. 
          See the <Link href="/" className="text-[#1a3a5c] font-bold hover:underline">homepage feed</Link> instead.
        </div>
      </div>
    </div>
  );
}
