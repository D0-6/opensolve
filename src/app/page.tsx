import { getProblems } from "@/lib/data";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";

export const dynamic = "force-dynamic";

const SOURCE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  YC_STARTUP: { label: "YC Startup", bgClass: "bg-surface-variant", textClass: "text-on-surface-variant" },
  GOVERNMENT: { label: "Government", bgClass: "bg-surface-variant", textClass: "text-on-surface-variant" },
  INDUSTRY: { label: "Industry", bgClass: "bg-surface-variant", textClass: "text-on-surface-variant" },
};

function ProblemCard({ problem, isFeatured }: { problem: any; isFeatured: boolean }) {
  const cfg = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;
  const hoursLeft = differenceInHours(new Date(problem.deadline), new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft < 72;
  const isPast = hoursLeft <= 0;

  let timeClass = "bg-primary/20 text-primary";
  if (isUrgent) timeClass = "bg-error/20 text-error";
  if (isPast) timeClass = "bg-surface-variant text-on-surface-variant";

  const timeText = isPast ? "Closed" : `in ${formatDistanceToNow(new Date(problem.deadline))}`;

  return (
    <Link
      href={`/problems/${problem.problemId}`}
      className={`glass-panel glass-card-hover rounded-xl p-6 flex flex-col gap-4 fade-in-up group relative overflow-hidden ${
        isFeatured ? "lg:col-span-2" : ""
      }`}
    >
      {isFeatured && <div className="absolute inset-0 bg-white/5 z-0"></div>}
      
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-1 rounded ${cfg.bgClass} ${cfg.textClass} font-label-mono text-[11px] leading-tight flex items-center gap-1 shrink-0`}>
            <span className="material-symbols-outlined text-[14px]">
              {problem.source === "GOVERNMENT" ? "account_balance" : "domain"}
            </span>
            {cfg.label}
          </span>
          <span className={`px-2 py-1 rounded ${timeClass} font-label-mono text-[11px] leading-tight flex items-center gap-1 shrink-0`}>
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {timeText}
          </span>
        </div>
        {isFeatured && problem.prizeAmount > 0 && (
          <span className="text-secondary font-display-lg-mobile text-2xl md:text-3xl font-bold">
            ${problem.prizeAmount.toLocaleString()}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-2 flex-grow">
        <h3 className={`${isFeatured ? "font-headline-md text-2xl md:text-3xl" : "font-body-lg text-lg font-semibold"} text-on-surface group-hover:text-primary transition-colors`}>
          {problem.title}
        </h3>
        {problem.description && (
          <p className={`font-body-md text-on-surface-variant mt-2 ${isFeatured ? "line-clamp-3" : "line-clamp-2"}`}>
            {problem.description}
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        {!isFeatured && problem.prizeAmount > 0 ? (
          <span className="font-body-md text-secondary font-bold shrink-0">${problem.prizeAmount.toLocaleString()}</span>
        ) : (
          <span className="font-label-mono text-[11px] leading-tight text-primary border border-primary/30 px-2 py-1 rounded shrink-0 truncate max-w-[120px]" title={problem.prizeType ? problem.prizeType.replace("_", " ") : "BOUNTY"}>
            {problem.prizeType ? problem.prizeType.replace("_", " ") : "BOUNTY"}
          </span>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-label-mono text-tertiary truncate">{problem.domain}</span>
          {isFeatured && (
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0">
              arrow_forward
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ source?: string; domain?: string }> }) {
  const sp = await searchParams;
  const problems = await getProblems(sp.source, sp.domain);
  const totalPrize = problems.reduce((sum: number, p: any) => sum + (p.prizeAmount || 0), 0);

  const sources = [
    { label: "All", value: undefined },
    { label: "YC Startups", value: "YC_STARTUP" },
    { label: "Government", value: "GOVERNMENT" },
    { label: "Industry", value: "INDUSTRY" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-32 overflow-hidden -mt-20">
        
        <div className="px-6 max-w-[1600px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-9 flex flex-col gap-6 fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-white/20 text-white w-max font-semibold">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-label-mono uppercase tracking-wider text-xs">Real Challenges · Real Rewards · Real Careers</span>
            </div>
            
            <h1 className="font-display-xl text-5xl md:text-8xl text-white font-bold leading-tight">
              Where Builders Meet <br />
              <span className="text-white">Real Opportunities.</span>
            </h1>
            
            <p className="font-body-lg text-lg md:text-xl text-zinc-400 max-w-2xl mt-4">
              Solve funded challenges from YC startups, government innovation programs, and top companies. Build your portfolio. Get hired. Win prizes.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <a href="#challenges" className="btn-primary px-8 py-4 rounded-xl font-bold text-lg">
                Browse Problems
              </a>
              <Link href="/organizations/new" className="btn-secondary px-8 py-4 rounded-xl font-bold text-lg">
                Post a Challenge
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-20 -mt-32 px-6 max-w-[1600px] mx-auto fade-in-up delay-300">
        <div className="glass-panel rounded-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          <div className="text-center px-4">
            <h3 className="font-display-lg text-3xl md:text-5xl text-primary">{problems.length}+</h3>
            <p className="font-label-mono text-on-surface-variant uppercase mt-2">Active Challenges</p>
          </div>
          <div className="text-center px-4">
            <h3 className="font-display-lg text-3xl md:text-5xl text-secondary">
              {totalPrize > 0 ? `$${(totalPrize / 1000).toFixed(0)}k+` : "Varied"}
            </h3>
            <p className="font-label-mono text-on-surface-variant uppercase mt-2">In Prizes</p>
          </div>
          <div className="text-center px-4">
            <h3 className="font-display-lg text-3xl md:text-5xl text-on-surface">Open</h3>
            <p className="font-label-mono text-on-surface-variant uppercase mt-2">To All Builders</p>
          </div>
          <div className="text-center px-4">
            <h3 className="font-display-lg text-3xl md:text-5xl text-on-surface flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
            </h3>
            <p className="font-label-mono text-on-surface-variant uppercase mt-2">Real Problems</p>
          </div>
        </div>
      </section>

      {/* Active Challenges Section */}
      <section id="challenges" className="py-32 px-6 max-w-[1600px] mx-auto relative">
        <div className="atmospheric-glow top-0 left-[-200px]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 fade-in-up">
          <div>
            <h2 className="font-headline-md text-3xl text-on-surface">Active Challenges</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0">
            {sources.map(({ label, value }) => {
              const isActive = sp.source === value || (!sp.source && !value);
              const href = value ? `/?source=${value}` : "/";
              return (
                <Link
                  key={label}
                  href={href}
                  scroll={false}
                  className={`px-4 py-2 rounded-full font-label-mono whitespace-nowrap transition-colors ${
                    isActive
                      ? "glass-panel border-primary text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bento Grid / Cards */}
        {problems.length === 0 ? (
          <div className="glass-panel rounded-xl p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">search_off</span>
            <p className="font-body-lg font-semibold mb-2 text-on-surface">No challenges found</p>
            <p className="font-body-md">Check back later or try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {problems.map((problem: any, idx: number) => (
              <ProblemCard key={problem.problemId} problem={problem} isFeatured={idx === 0} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-surface-container-low/50 relative border-t border-white/5 mx-[-24px] px-6">
        <div className="atmospheric-glow bottom-0 right-[-200px]"></div>
        
        <div className="max-w-[1600px] mx-auto text-center mb-16 fade-in-up">
          <h2 className="font-headline-md text-3xl text-on-surface">How OpenSolve Works</h2>
          <p className="font-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">A transparent pipeline from challenge to career</p>
        </div>
        
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* For Builders */}
          <div className="fade-in-up delay-100 relative">
            <div className="absolute left-[24px] top-12 bottom-0 w-[1px] bg-white/20 hidden md:block z-0"></div>
            <h3 className="font-headline-md text-2xl text-secondary mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined bg-surface-variant p-2 rounded-lg">code</span>
              For Students & Builders
            </h3>
            <div className="space-y-8 relative z-10">
              {[
                { num: "01", title: "Browse Challenges", desc: "Filter by domain, prize type, or source. Find problems that match your skills." },
                { num: "02", title: "Submit Your Solution", desc: "Share your GitHub repo + writeup. Your solution is public and verifiable." },
                { num: "03", title: "Get Hired or Win", desc: "Top submissions get contacted directly by companies for jobs or contracts." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-highest border border-secondary/30 flex items-center justify-center font-label-mono text-secondary z-10">
                    {num}
                  </div>
                  <div>
                    <h4 className="font-body-lg font-semibold text-on-surface">{title}</h4>
                    <p className="font-body-md text-on-surface-variant mt-2">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Orgs */}
          <div className="fade-in-up delay-200 relative">
            <div className="absolute left-[24px] top-12 bottom-0 w-[1px] bg-white/20 hidden md:block z-0"></div>
            <h3 className="font-headline-md text-2xl text-primary mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined bg-surface-variant p-2 rounded-lg">domain</span>
              For Companies & Orgs
            </h3>
            <div className="space-y-8 relative z-10">
              {[
                { num: "01", title: "Post a Challenge", desc: "Describe your problem, set a prize, and publish. We surface it to thousands of builders." },
                { num: "02", title: "Review Submissions", desc: "All solutions are ranked by score. View GitHub repos, demos, and writeups at a glance." },
                { num: "03", title: "Contact Top Talent", desc: "Reach out to your top performers directly. Hire, contract, or pilot their solution." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-highest border border-primary/30 flex items-center justify-center font-label-mono text-primary z-10">
                    {num}
                  </div>
                  <div>
                    <h4 className="font-body-lg font-semibold text-on-surface">{title}</h4>
                    <p className="font-body-md text-on-surface-variant mt-2">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intersection Observer init Script equivalent */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof document !== 'undefined') {
              const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
              const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                  }
                });
              }, observerOptions);
              setTimeout(() => {
                document.querySelectorAll('.fade-in-up').forEach(el => {
                  el.style.animationPlayState = 'paused';
                  observer.observe(el);
                });
              }, 100);
            }
          `,
        }}
      />
    </>
  );
}
