"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Building2, Plus, X, Loader2, Link as LinkIcon, FileText, Briefcase, Calendar, LayoutGrid, CheckCircle2 } from "lucide-react";

export default function ProfessionalPostChallenge() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  useEffect(() => {
    if (isLoaded && (!user || user.publicMetadata?.role !== "organization")) {
      router.push("/sign-in");
    }
  }, [user, isLoaded, router]);
  
  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    description: "",
    source: "INDUSTRY",
    sourceUrl: "",
    prizeAmount: "",
    prizeType: "CONTRACT",
    deadline: "",
  });
  
  const [resourceLinks, setResourceLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddLink = () => setResourceLinks([...resourceLinks, ""]);
  
  const handleLinkChange = (index: number, value: string) => {
    const updated = [...resourceLinks];
    updated[index] = value;
    setResourceLinks(updated);
  };
  
  const handleRemoveLink = (index: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Filter out empty links
    const validLinks = resourceLinks.filter(link => link.trim() !== "");

    try {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: new Date(formData.deadline).toISOString(),
          resourceLinks: validLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post challenge");
      router.push(`/problems/${data.problem.problemId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-white border border-zinc-300 px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] transition-all font-body-md text-sm";
  const labelStyles = "block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider";

  if (!isLoaded || !user || user.publicMetadata?.role !== "organization") {
    return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="w-full max-w-[125rem] mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-zinc-200 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-600">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-zinc-900 tracking-tight">Post a Direct Hiring Challenge</h1>
              <p className="text-zinc-500 text-base mt-1">Deploy a real-world problem to vetted talent and hire the best solutions directly.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#1a3a5c]/10 border border-[#1a3a5c]/20 text-[#1a3a5c] p-4 rounded-md mb-8 font-medium flex items-center gap-3">
            <X size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Section 1: Basic Info */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center gap-2 mb-6 text-zinc-900 border-b border-zinc-200 pb-2">
                <FileText size={20} className="text-[#1a3a5c]" />
                <h2 className="text-xl font-medium">Challenge Details</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={labelStyles}>Challenge Title *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Optimize Real-Time Trading Algorithms" className={inputStyles} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyles}>Technical Domain *</label>
                    <input required type="text" value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="e.g., Machine Learning, Fintech" className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>Organization Type</label>
                    <select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className={inputStyles}>
                      <option value="INDUSTRY">Enterprise / Corporate</option>
                      <option value="YC_STARTUP">YC / VC-Backed Startup</option>
                      <option value="GOVERNMENT">Government / Non-Profit</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelStyles}>Comprehensive Description *</label>
                  <textarea required rows={8} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Provide deep technical context, architectural constraints, and expected outcomes. The more detailed, the better the submissions." className={`${inputStyles} resize-y`} />
                </div>
              </div>
            </section>

            {/* Section 2: Resources */}
            <section className="bg-white border border-zinc-200 p-8">
              <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2 text-zinc-900">
                  <LinkIcon size={20} className="text-[#1a3a5c]" />
                  <h2 className="text-xl font-medium">Datasets & Resources</h2>
                </div>
                <button type="button" onClick={handleAddLink} className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 hover:bg-zinc-100 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Add Link
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Provide URLs to Google Drive folders, Kaggle datasets, GitHub repos, or API documentation.</p>
              
              <div className="space-y-4">
                {resourceLinks.map((link, index) => (
                  <div key={index} className="flex gap-3">
                    <input type="url" value={link} onChange={(e) => handleLinkChange(index, e.target.value)} placeholder="https://..." className={inputStyles} />
                    {resourceLinks.length > 1 && (
                      <button type="button" onClick={() => handleRemoveLink(index)} className="p-3 border border-zinc-200 text-zinc-500 hover:text-[#1a3a5c] hover:border-[#1a3a5c] transition-colors bg-white">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Logistics */}
          <div className="space-y-6">
            <section className="bg-zinc-50 border border-zinc-200 p-6 sticky top-24">
              <h3 className="text-lg font-medium text-zinc-900 flex items-center gap-2 mb-6 border-b border-zinc-200 pb-2">
                <Briefcase size={18} className="text-[#1a3a5c]" /> Logistics & Payout
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={labelStyles}>Outcome / Reward *</label>
                  <select value={formData.prizeType} onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })} className={inputStyles}>
                    <option value="HIRING">Full-Time Hiring Offer</option>
                    <option value="CONTRACT">Paid Contract / Freelance</option>
                    <option value="CASH">Cash Bounty</option>
                    <option value="PILOT_FUNDING">Pilot Program Funding</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyles}>Budget / Prize Amount (USD)</label>
                  <input type="number" min="0" value={formData.prizeAmount} onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })} placeholder="e.g. 5000" className={inputStyles} />
                </div>

                <div>
                  <label className={labelStyles}>Submission Deadline *</label>
                  <input required type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className={inputStyles} />
                </div>

                <div>
                  <label className={labelStyles}>Official Org URL (Optional)</label>
                  <input type="url" value={formData.sourceUrl} onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} placeholder="https://your-company.com" className={inputStyles} />
                </div>
                
                <div className="pt-6 border-t border-zinc-200">
                  <button type="submit" disabled={loading} className="w-full btn-primary font-medium py-3 flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><CheckCircle2 size={20} /> Publish to Talent Pool</>}
                  </button>
                  <p className="text-xs text-center text-zinc-500 mt-4 font-medium">By publishing, you agree to evaluate submissions fairly.</p>
                </div>
              </div>
            </section>
          </div>

        </form>
      </div>
    </div>
  );
}
