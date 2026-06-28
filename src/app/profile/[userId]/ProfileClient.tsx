"use client";

import { useState } from "react";
import {
  GitBranch, Trophy, Calendar, Pencil, X, Save, Loader2,
  ExternalLink, Globe, Phone, GraduationCap, MapPin, Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { updateProfile } from "./actions";

const COUNTRIES_WITH_CODES = [
  { name: "India", code: "IN", dial: "+91" },
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "France", code: "FR", dial: "+33" },
  { name: "Netherlands", code: "NL", dial: "+31" },
  { name: "Singapore", code: "SG", dial: "+65" },
  { name: "United Arab Emirates", code: "AE", dial: "+971" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Nigeria", code: "NG", dial: "+234" },
  { name: "Kenya", code: "KE", dial: "+254" },
  { name: "South Africa", code: "ZA", dial: "+27" },
  { name: "Pakistan", code: "PK", dial: "+92" },
  { name: "Bangladesh", code: "BD", dial: "+880" },
  { name: "Philippines", code: "PH", dial: "+63" },
  { name: "Indonesia", code: "ID", dial: "+62" },
  { name: "Malaysia", code: "MY", dial: "+60" },
  { name: "Sri Lanka", code: "LK", dial: "+94" },
  { name: "Nepal", code: "NP", dial: "+977" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "Colombia", code: "CO", dial: "+57" },
  { name: "Argentina", code: "AR", dial: "+54" },
  { name: "Turkey", code: "TR", dial: "+90" },
  { name: "Egypt", code: "EG", dial: "+20" },
  { name: "Ghana", code: "GH", dial: "+233" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "South Korea", code: "KR", dial: "+82" },
  { name: "Vietnam", code: "VN", dial: "+84" },
  { name: "Poland", code: "PL", dial: "+48" },
  { name: "Ukraine", code: "UA", dial: "+380" },
  { name: "Italy", code: "IT", dial: "+39" },
  { name: "Spain", code: "ES", dial: "+34" },
  { name: "Sweden", code: "SE", dial: "+46" },
  { name: "Israel", code: "IL", dial: "+972" },
  { name: "Saudi Arabia", code: "SA", dial: "+966" },
  { name: "Morocco", code: "MA", dial: "+212" },
  { name: "New Zealand", code: "NZ", dial: "+64" },
  { name: "Ireland", code: "IE", dial: "+353" },
  { name: "Switzerland", code: "CH", dial: "+41" },
  { name: "Belgium", code: "BE", dial: "+32" },
  { name: "Other", code: "OTHER", dial: "" },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 12 }, (_, i) => String(CURRENT_YEAR - 2 + i));

function getCountryName(code: string) {
  return COUNTRIES_WITH_CODES.find(c => c.code === code)?.name || code;
}

interface ProfileData {
  name?: string;
  bio?: string;
  githubUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  country?: string;
  countryCode?: string;
  phone?: string;
  collegeOrInstitution?: string;
  degree?: string;
  graduationYear?: string;
  skills?: string[];
  totalScore?: number;
  joinedAt?: string;
  scoutPoints?: number;
  scoutSubmissions?: number;
  openToWork?: boolean;
}

export default function ProfileClient({
  isOwner,
  profile,
  submissions,
  userId,
  fallbackName,
  imageUrl,
  viewerRole,
}: {
  isOwner: boolean;
  profile: Record<string, unknown>;
  submissions: Record<string, unknown>[];
  userId: string;
  fallbackName?: string;
  imageUrl?: string;
  viewerRole?: string; // 'organization' | 'student' | undefined
}) {
  const p = profile as ProfileData;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await updateProfile(formData);
    setIsEditing(false);
    setLoading(false);
    window.location.reload();
  };

  const inputStyles = "w-full bg-white border border-zinc-300 px-3 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-colors text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider";

  const displayName = p?.name || fallbackName || `User ${userId.slice(0, 8)}`;

  return (
    <div className="w-full max-w-[125rem] mx-auto mt-12 space-y-8 px-6 pb-16">

      {/* Profile Header Card */}
      <div className="bg-white border border-zinc-200 p-8 relative">
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 text-zinc-400 hover:text-[#1a3a5c] transition-colors bg-white border border-zinc-200 p-2 hover:bg-zinc-50"
            title="Edit Profile"
          >
            <Pencil size={18} />
          </button>
        )}

        {!isEditing ? (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="w-28 h-28 bg-zinc-100 border border-zinc-200 flex-shrink-0 flex items-center justify-center text-[#1a3a5c] text-5xl font-medium overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">{displayName}</h1>
                {!isEditing && p?.openToWork && (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Open to Work
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {p?.country && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-zinc-400" />
                    {getCountryName(p.country)}
                  </span>
                )}
                {p?.collegeOrInstitution && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-zinc-400" />
                    {p.collegeOrInstitution}
                    {p?.graduationYear && ` · ${p.graduationYear}`}
                  </span>
                )}
                {p?.degree && !p?.collegeOrInstitution && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-zinc-400" />
                    {p.degree}
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className="text-zinc-600 mb-5 max-w-xl text-sm leading-relaxed">
                {p?.bio || "A brilliant problem solver working on exciting challenges."}
              </p>

              {/* Skills */}
              {p?.skills && Array.isArray(p.skills) && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.skills.map((skill: string) => (
                    <span key={skill} className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Links & Stats */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-[#1a3a5c]" />
                  {p?.totalScore || 0} Score
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Joined {p?.joinedAt ? new Date(p.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}
                </div>

                {/* Scout Points Badge */}
                {(p?.scoutPoints || 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 uppercase tracking-wider">
                    🕵️ {(p.scoutPoints || 0).toLocaleString()} Scout Points
                  </div>
                )}

                {/* Elite Scout badge — earned at 500+ points */}
                {(p?.scoutPoints || 0) >= 500 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-300 px-3 py-1.5 uppercase tracking-wider">
                    🏆 Elite Scout
                  </div>
                )}

                {/* GitHub */}
                {(p?.githubUrl || p?.githubUsername) && (
                  <a
                    href={p.githubUrl || `https://github.com/${p.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                  >
                    <GitBranch className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}

                {/* LinkedIn */}
                {p?.linkedinUrl && (
                  <a
                    href={p.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}

                {/* Portfolio */}
                {p?.portfolioUrl && (
                  <a
                    href={p.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-colors uppercase tracking-wider"
                  >
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}

                {/* Phone — only shown to org viewers or the owner */}
                {p?.phone && (isOwner || viewerRole === "organization" || viewerRole === "company") && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" /> {p.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200">
              <h2 className="text-lg font-medium text-zinc-900">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Full Name *</label>
                <input name="name" type="text" required defaultValue={p?.name || fallbackName || ""} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Bio</label>
                <input name="bio" type="text" defaultValue={p?.bio || ""} className={inputStyles} maxLength={500} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>College / Institution</label>
                <input name="collegeOrInstitution" type="text" defaultValue={p?.collegeOrInstitution || ""} className={inputStyles} placeholder="IIT Bombay" />
              </div>
              <div>
                <label className={labelStyles}>Degree</label>
                <input name="degree" type="text" defaultValue={p?.degree || ""} className={inputStyles} placeholder="B.Tech Computer Science" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Graduation Year</label>
                <select name="graduationYear" defaultValue={p?.graduationYear || ""} className={inputStyles}>
                  <option value="">Select...</option>
                  {GRAD_YEARS.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Country</label>
                <select name="country" defaultValue={p?.country || ""} className={inputStyles}>
                  <option value="">Select...</option>
                  {COUNTRIES_WITH_CODES.map(({ name, code }) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>GitHub URL</label>
                <input name="githubUrl" type="url" defaultValue={p?.githubUrl || (p?.githubUsername ? `https://github.com/${p.githubUsername}` : "")} className={`${inputStyles} font-mono`} placeholder="https://github.com/username" />
              </div>
              <div>
                <label className={labelStyles}>LinkedIn URL</label>
                <input name="linkedinUrl" type="url" defaultValue={p?.linkedinUrl || ""} className={inputStyles} placeholder="https://linkedin.com/in/..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Portfolio URL</label>
                <input name="portfolioUrl" type="url" defaultValue={p?.portfolioUrl || ""} className={inputStyles} placeholder="https://yoursite.com" />
              </div>
              <div>
                <label className={labelStyles}>Phone Number</label>
                <div className="flex gap-0">
                  <select name="countryCode" defaultValue={p?.countryCode || ""} className="bg-white border border-zinc-300 border-r-0 px-2 py-2.5 text-sm text-zinc-900 focus:outline-none min-w-[80px]">
                    <option value="">+</option>
                    {COUNTRIES_WITH_CODES.filter(c => c.dial).map(({ code, dial }) => (
                      <option key={code} value={dial}>{dial}</option>
                    ))}
                  </select>
                  <input name="phone" type="tel" defaultValue={p?.phone?.replace(/^\+\d+/, "") || ""} className={`${inputStyles} flex-1`} placeholder="Phone number" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelStyles}>Skills (comma separated)</label>
              <input name="skills" type="text" defaultValue={Array.isArray(p?.skills) ? p.skills.join(", ") : ""} className={inputStyles} placeholder="React, Python, AWS" />
            </div>

            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-4">
              <input 
                type="checkbox" 
                id="openToWork" 
                name="openToWork" 
                defaultChecked={!!p?.openToWork}
                className="w-4 h-4 text-[#1a3a5c] border-zinc-300 rounded focus:ring-[#1a3a5c]"
              />
              <label htmlFor="openToWork" className="text-sm font-medium text-zinc-700">
                I am open to job opportunities and contract work
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#1a3a5c] hover:bg-[#112740] transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Education Card — only when not editing and institution/degree exists */}
      {!isEditing && (p?.collegeOrInstitution || p?.degree) && (
        <div className="bg-white border border-zinc-200 p-6">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <GraduationCap size={14} /> Education
          </h2>
          <div className="flex flex-wrap gap-8">
            {p?.collegeOrInstitution && (
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Institution</div>
                <div className="font-medium text-zinc-900 text-sm">{p.collegeOrInstitution}</div>
              </div>
            )}
            {p?.degree && (
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Degree</div>
                <div className="font-medium text-zinc-900 text-sm">{p.degree}</div>
              </div>
            )}
            {p?.graduationYear && (
              <div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Graduation</div>
                <div className="font-medium text-zinc-900 text-sm">{p.graduationYear}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions History (Project Gallery) */}
      <div>
        <h2 className="text-xl font-medium text-zinc-900 mb-6 border-b border-zinc-200 pb-3 flex items-center justify-between">
          Project Gallery
          <span className="text-sm font-normal text-zinc-500">{submissions.length} project{submissions.length !== 1 ? "s" : ""}</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submissions.length === 0 ? (
            <div className="col-span-full bg-white border border-dashed border-zinc-200 p-12 text-center">
              <LinkIcon size={24} className="mx-auto text-zinc-300 mb-3" />
              <p className="text-zinc-500 text-sm font-medium">No projects yet</p>
              <p className="text-zinc-400 text-xs mt-1">Browse challenges and submit your first solution to build your record.</p>
              <Link href="/challenges" className="inline-block mt-4 text-xs font-bold text-[#1a3a5c] uppercase tracking-wider hover:underline">
                Browse Challenges →
              </Link>
            </div>
          ) : (
            submissions.map((sub) => {
              // Try to parse video URL to get an embed URL
              let embedUrl = "";
              const vidUrl = sub.videoUrl as string;
              if (vidUrl) {
                if (vidUrl.includes("youtube.com/watch?v=")) {
                  embedUrl = vidUrl.replace("watch?v=", "embed/");
                } else if (vidUrl.includes("youtu.be/")) {
                  embedUrl = `https://www.youtube.com/embed/${vidUrl.split("youtu.be/")[1]}`;
                } else if (vidUrl.includes("loom.com/share/")) {
                  embedUrl = vidUrl.replace("share", "embed");
                }
              }

              return (
                <div key={`${sub.problemId}-${sub.submittedAt}`} className="bg-white border border-zinc-200 flex flex-col hover:border-[#1a3a5c] transition-colors shadow-sm overflow-hidden">
                  
                  {/* Video Embed or Fallback Header */}
                  {embedUrl ? (
                    <div className="aspect-video w-full bg-zinc-900">
                      <iframe 
                        src={embedUrl} 
                        className="w-full h-full" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-zinc-100 flex items-center justify-center border-b border-zinc-200">
                      <Trophy size={32} className="text-zinc-300" />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <Link href={`/problems/${sub.problemId}`} className="text-lg font-semibold text-zinc-900 hover:text-[#1a3a5c] transition-colors line-clamp-1">
                          {(sub.repoName as string) || "View Submission"}
                        </Link>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">
                          {new Date(sub.submittedAt as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-center px-3 py-1.5 bg-zinc-50 border border-zinc-200 shrink-0">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Score</div>
                        <div className="font-semibold text-sm text-zinc-900">{sub.score as number}</div>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-600 mb-6 flex-1 line-clamp-3">
                      {sub.writeup as string}
                    </p>

                    {Array.isArray(sub.techStack) && sub.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {sub.techStack.map((tech, i) => (
                          <span key={i} className="px-2.5 py-1 text-xs font-medium bg-[#1a3a5c]/5 text-[#1a3a5c] border border-[#1a3a5c]/10 rounded-full">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                      {Boolean(sub.evaluationStatus && sub.evaluationStatus !== "PENDING") && (
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                          sub.evaluationStatus === "HIRED" ? "bg-green-100 text-green-700 border border-green-200" :
                          sub.evaluationStatus === "CONTRACT_OFFERED" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          sub.evaluationStatus === "INTERVIEW_REQUESTED" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                          "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}>
                          {String(sub.evaluationStatus).replace(/_/g, " ")}
                        </span>
                      )}
                      
                      <div className="flex gap-3 ml-auto">
                        {Boolean(sub.demoUrl) && (
                          <a href={sub.demoUrl as string} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] uppercase tracking-wider transition-colors">
                            <Globe size={14} /> Demo
                          </a>
                        )}
                        <a href={sub.githubUrl as string} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#1a3a5c] uppercase tracking-wider transition-colors">
                          <GitBranch size={14} /> Code
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
