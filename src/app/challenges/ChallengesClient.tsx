"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import {
  Search, Lock, SlidersHorizontal, X, ChevronDown,
  Briefcase, Users, Trophy, Clock, ArrowRight
} from "lucide-react";

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  YC_STARTUP: { label: "YC Startup", color: "bg-orange-50 text-orange-700 border-orange-200" },
  GOVERNMENT: { label: "Government", color: "bg-blue-50 text-blue-700 border-blue-200" },
  INDUSTRY: { label: "Industry", color: "bg-zinc-100 text-zinc-700 border-zinc-200" },
  COMMUNITY: { label: "Community", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

const PRIZE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  HIRING: { label: "Full-Time Hire", color: "bg-green-50 text-green-700 border-green-200" },
  CONTRACT: { label: "Contract", color: "bg-blue-50 text-blue-700 border-blue-200" },
  CASH: { label: "Cash Prize", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PRIZE_ONLY: { label: "Prize", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

interface Problem {
  problemId: string;
  title: string;
  description?: string;
  source: string;
  domain: string;
  prizeAmount: number;
  prizeType?: string;
  deadline: string;
  postedAt?: string;
  allowedCountries?: string[];
  requiredSkills?: string[];
  maxTeamSize?: number;
  verified?: boolean;
  [key: string]: unknown;
}

export default function ChallengesClient({
  problems,
  allDomains,
}: {
  problems: Problem[];
  allDomains: string[];
}) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("ALL");
  const [domain, setDomain] = useState("ALL");
  const [prizeType, setPrizeType] = useState("ALL");
  const [sortBy, setSortBy] = useState("deadline");
  const [showFilters, setShowFilters] = useState(false);
  const [countryOnly, setCountryOnly] = useState(false);

  const filtered = useMemo(() => {
    let res = [...problems];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (p.requiredSkills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }

    // Source filter
    if (source !== "ALL") res = res.filter(p => p.source === source);

    // Domain filter
    if (domain !== "ALL") res = res.filter(p => p.domain === domain);

    // Prize type filter
    if (prizeType !== "ALL") res = res.filter(p => p.prizeType === prizeType);

    // Global only (hide country-restricted)
    if (countryOnly) res = res.filter(p => !Array.isArray(p.allowedCountries) || p.allowedCountries.length === 0);

    // Sort
    if (sortBy === "deadline") {
      res.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortBy === "prize") {
      res.sort((a, b) => (Number(b.prizeAmount) || 0) - (Number(a.prizeAmount) || 0));
    } else if (sortBy === "newest") {
      res.sort((a, b) => new Date(b.postedAt || "").getTime() - new Date(a.postedAt || "").getTime());
    }

    return res;
  }, [problems, query, source, domain, prizeType, sortBy, countryOnly]);

  const activeFilterCount = [
    source !== "ALL",
    domain !== "ALL",
    prizeType !== "ALL",
    countryOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSource("ALL");
    setDomain("ALL");
    setPrizeType("ALL");
    setCountryOnly(false);
    setSortBy("deadline");
  };

  return (
    <div className="w-full max-w-[125rem] mx-auto px-6 pt-28 pb-24 min-h-screen bg-white">

      {/* Page header */}
      <div className="mb-10 border-b border-zinc-200 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-2">
            Open Challenges
          </h1>
          <p className="text-zinc-500 text-base">
            {problems.length} active challenge{problems.length !== 1 ? "s" : ""} from startups, government bodies, and top companies.
          </p>
        </div>
        <Link href="/challenges/submit" className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium px-5 py-2.5 transition-colors text-sm flex items-center gap-2 whitespace-nowrap shadow-sm">
          <Globe size={16} /> Submit a Link
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">

        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-zinc-400" />
          </div>
          <input
            type="text"
            id="challenge-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, domain, or skill…"
            className="w-full pl-11 pr-4 py-3 border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1a3a5c] focus:bg-white transition-colors text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            id="challenge-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="appearance-none w-full md:w-48 pl-4 pr-10 py-3 border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm focus:outline-none focus:border-[#1a3a5c] cursor-pointer"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="prize">Sort: Prize Amount</option>
            <option value="newest">Sort: Newest</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        {/* Filters toggle */}
        <button
          id="toggle-filters"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 border text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
              : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 bg-white text-[#1a3a5c] text-[11px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="bg-zinc-50 border border-zinc-200 p-6 mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Source */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Source</label>
            <div className="flex flex-col gap-2">
              {["ALL", "YC_STARTUP", "GOVERNMENT", "INDUSTRY", "COMMUNITY"].map(val => (
                <button
                  key={val}
                  onClick={() => setSource(val)}
                  className={`text-left px-3 py-2 text-sm border transition-colors ${
                    source === val
                      ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white"
                  }`}
                >
                  {val === "ALL" ? "All Sources" : SOURCE_CONFIG[val]?.label || val}
                </button>
              ))}
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Domain</label>
            <div className="relative">
              <select
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2 border border-zinc-200 bg-white text-zinc-700 text-sm focus:outline-none focus:border-[#1a3a5c]"
              >
                <option value="ALL">All Domains</option>
                {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Prize type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Reward Type</label>
            <div className="flex flex-col gap-2">
              {["ALL", "HIRING", "CONTRACT", "CASH", "PRIZE_ONLY"].map(val => (
                <button
                  key={val}
                  onClick={() => setPrizeType(val)}
                  className={`text-left px-3 py-2 text-sm border transition-colors ${
                    prizeType === val
                      ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white"
                  }`}
                >
                  {val === "ALL" ? "All Types" : PRIZE_TYPE_CONFIG[val]?.label || val}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Eligibility</label>
            <button
              onClick={() => setCountryOnly(!countryOnly)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm border transition-colors ${
                countryOnly
                  ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400 bg-white"
              }`}
            >
              <Globe size={14} /> Hide Country-Restricted
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
              >
                <X size={12} /> Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between mb-4 text-xs text-zinc-500 font-bold uppercase tracking-wider">
        <span>{filtered.length} challenge{filtered.length !== 1 ? "s" : ""} found</span>
        {query && <span>Results for &quot;{query}&quot;</span>}
      </div>

      {/* Challenge list */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-zinc-200 py-20 text-center">
          <Search size={36} className="mx-auto text-zinc-200 mb-4" />
          <p className="text-zinc-500 font-medium text-lg">No challenges match your search</p>
          <p className="text-zinc-400 text-sm mt-1 mb-6">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="btn-primary px-6 py-2.5 text-sm">Clear Filters</button>
        </div>
      ) : (
        <div className="flex flex-col border-t border-zinc-200">
          {filtered.map(problem => {
            const src = SOURCE_CONFIG[problem.source] || SOURCE_CONFIG.INDUSTRY;
            const prize = PRIZE_TYPE_CONFIG[problem.prizeType || ""] || null;
            const hoursLeft = differenceInHours(new Date(problem.deadline), new Date());
            const isPast = hoursLeft <= 0;
            const isUrgent = hoursLeft > 0 && hoursLeft <= 72;
            const isRestricted = Array.isArray(problem.allowedCountries) && problem.allowedCountries.length > 0;
            const timeText = isPast
              ? "Closed"
              : isUrgent
              ? `Closes in ${formatDistanceToNow(new Date(problem.deadline))}`
              : formatDistanceToNow(new Date(problem.deadline), { addSuffix: true });

            return (
              <Link
                key={problem.problemId}
                href={`/problems/${problem.problemId}`}
                className={`block border-b border-zinc-100 py-5 px-4 -mx-4 hover:bg-zinc-50 transition-colors group ${isPast ? "opacity-50" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">

                  {/* Left: meta + title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${src.color}`}>
                        {src.label}
                      </span>
                      {prize && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${prize.color}`}>
                          {prize.label}
                        </span>
                      )}
                      {problem.verified && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-green-200 bg-green-50 text-green-700">
                          ✓ Verified
                        </span>
                      )}
                      {problem.scoutId && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1">
                          🕵️ Scouted
                        </span>
                      )}
                      {isRestricted && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-700">
                          <Lock size={9} /> Country Restricted
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-zinc-900 group-hover:text-[#1a3a5c] transition-colors truncate mb-1">
                      {problem.title}
                    </h3>

                    {problem.description && (
                      <p className="text-sm text-zinc-500 line-clamp-1">{problem.description}</p>
                    )}

                    {/* Skills */}
                    {Array.isArray(problem.requiredSkills) && problem.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {problem.requiredSkills.slice(0, 5).map((s: string) => (
                          <span key={s} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 font-medium">
                            {s}
                          </span>
                        ))}
                        {problem.requiredSkills.length > 5 && (
                          <span className="text-[10px] text-zinc-400">+{problem.requiredSkills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: prize + deadline + meta */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0">
                    <div className="text-right">
                      {problem.prizeAmount > 0 ? (
                        <div className="text-lg font-bold text-zinc-900">
                          ${problem.prizeAmount.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                          {prize?.label || "Bounty"}
                        </div>
                      )}
                      <div className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1 ${isUrgent ? "text-red-500" : isPast ? "text-zinc-400" : "text-zinc-400"}`}>
                        <Clock size={10} /> {timeText}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      {typeof problem.maxTeamSize === "number" && (
                        <span className="flex items-center gap-1">
                          <Users size={11} /> up to {problem.maxTeamSize}
                        </span>
                      )}
                      <span className="font-mono">{problem.domain}</span>
                    </div>

                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-[#1a3a5c] group-hover:translate-x-1 transition-all hidden md:block" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Globe icon inline since it's not in the outer import
function Globe({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
