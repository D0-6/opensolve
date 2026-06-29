import { currentUser } from "@clerk/nextjs/server";
import { getProblem } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { docClient } from "@/lib/dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import Link from "next/link";
import { ArrowLeft, User, Briefcase, GraduationCap, GitBranch } from "lucide-react";
import { submitApplication } from "./actions";

export const dynamic = "force-dynamic";

const APPLICATIONS_TABLE = process.env.DYNAMODB_TABLE_APPLICATIONS || "OpenSolve_Applications";
const PROFILES_TABLE = process.env.DYNAMODB_TABLE_PROFILES || "OpenSolve_Profiles";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    redirect(`/sign-in?redirect_url=/problems/${id}/apply`);
  }

  const problem = await getProblem(id);
  if (!problem) notFound();

  // Check if they already applied
  let existingApp = null;
  try {
    const res = await docClient.send(new GetCommand({
      TableName: APPLICATIONS_TABLE,
      Key: { problemId: id, userId: user.id }
    }));
    existingApp = res.Item;
  } catch (err) {
    console.error(err);
  }

  if (existingApp) {
    // If already applied, bypass straight to team formation
    redirect(`/problems/${id}/team`);
  }

  // Fetch their profile for the read-only snapshot review
  let profile = null;
  try {
    const res = await docClient.send(new GetCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: user.id }
    }));
    profile = res.Item;
  } catch (err) {
    console.error(err);
  }

  if (!profile) {
    // Middleware should catch this, but just in case
    redirect("/onboarding/student");
  }

  // Check country eligibility
  const isRestricted = Array.isArray(problem.allowedCountries) && problem.allowedCountries.length > 0;
  if (isRestricted && (!profile.country || !problem.allowedCountries.includes(profile.country))) {
    return (
      <div className="min-h-screen bg-white/5 flex items-center justify-center p-6">
        <div className="bg-transparent border border-red-200 p-8 max-w-lg w-full text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
          <h1 className="text-xl font-medium text-white mb-2">Not Eligible</h1>
          <p className="text-zinc-400 mb-6 text-sm">
            This challenge is restricted to specific countries and your profile indicates you are not eligible to apply.
          </p>
          <Link href={`/problems/${id}`} className="btn-primary inline-block px-6 py-2 text-sm">
            Return to Problem
          </Link>
        </div>
      </div>
    );
  }

  const inputStyles = "w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-400 focus:bg-transparent transition-colors text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        <Link href={`/problems/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Problem
        </Link>

        <h1 className="text-3xl font-medium text-white mb-2 tracking-tight">Apply to Work</h1>
        <p className="text-zinc-400 mb-8">
          Submit your application intent for <strong className="text-zinc-200">{problem.title}</strong>. Organizations review applications to decide who gets hired or contracted.
        </p>

        {/* Profile Snapshot Warning */}
        <div className="bg-white/5 border border-white/10 p-6 mb-10">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User size={16} /> Profile Snapshot Included
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            The organization will see the following details from your profile when reviewing your application. Make sure they are up to date.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-transparent border border-white/10 p-4">
            <div><span className="font-medium text-white">Name:</span> <span className="text-zinc-400">{profile.name}</span></div>
            <div><span className="font-medium text-white">Country:</span> <span className="text-zinc-400">{profile.country}</span></div>
            <div className="flex items-center gap-1.5"><GraduationCap size={14} className="text-zinc-400" /> <span className="text-zinc-400">{profile.collegeOrInstitution || profile.degree || "N/A"}</span></div>
            <div className="flex items-center gap-1.5"><GitBranch size={14} className="text-zinc-400" /> <span className="text-zinc-400 truncate">{profile.githubUrl || "Not provided"}</span></div>
          </div>
          <div className="mt-4 text-right">
            <Link href={`/profile/${user.id}`} target="_blank" className="text-xs font-bold text-blue-400 uppercase tracking-wider hover:underline">
              Edit Profile in New Tab →
            </Link>
          </div>
        </div>

        <form action={submitApplication.bind(null, id)} className="space-y-8">
          
          <div>
            <label htmlFor="motivation" className={labelStyles}>Motivation & Approach *</label>
            <p className="text-xs text-zinc-400 mb-3">Why do you want to work on this, and what is your high-level technical approach?</p>
            <textarea 
              required
              id="motivation"
              name="motivation" 
              rows={4}
              className={`${inputStyles} resize-y`}
              placeholder="I've worked on similar distributed systems issues before. My approach would involve..."
            />
          </div>

          <div>
            <label htmlFor="experience" className={labelStyles}>Relevant Experience</label>
            <p className="text-xs text-zinc-400 mb-3">Highlight any specific projects, hacks, or past work that proves you can build this.</p>
            <textarea 
              id="experience"
              name="experience" 
              rows={3}
              className={`${inputStyles} resize-y`}
              placeholder="I built an open-source tool last year that handled..."
            />
          </div>

          <div>
            <label htmlFor="timeline" className={labelStyles}>Estimated Timeline *</label>
            <p className="text-xs text-zinc-400 mb-3">How many weeks or days do you estimate it will take your team to deliver a working solution?</p>
            <input 
              required
              id="timeline"
              name="timeline" 
              type="text"
              className={inputStyles}
              placeholder="e.g. 2 weeks (approx 20 hrs/week)"
            />
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">
              Next step: You can optionally form a team before you submit your final solution.
            </p>
            <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3 text-sm font-medium">
              Submit Application & Continue
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
