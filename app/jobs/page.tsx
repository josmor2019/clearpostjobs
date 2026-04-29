"use client";

import { JobCard } from "@/components/JobCard";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

function computeMatchScore(job: UiJob, userSkills: string, userTitle: string): number {
  const haystack = `${job.title} ${job.company}`.toLowerCase();
  const profileText = `${userSkills} ${userTitle}`.toLowerCase();
  if (!profileText.trim()) return 0;

  const tokens = profileText
    .split(/[\s,;/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);

  if (tokens.length === 0) return 0;

  const matches = tokens.filter((t) => haystack.includes(t)).length;
  const raw = Math.round((matches / tokens.length) * 100);
  return Math.min(99, Math.max(30, raw + 30));
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract"];
const LOCATION_MODES = ["Remote", "On-site", "Hybrid"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Staff"];

export type UiJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  experience: string;
  posted: string;
};

function inferLocationType(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("remote")) return "Remote";
  if (l.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function postedDateString(row: Record<string, unknown>): string {
  const v =
    row.posted_at ?? row.posted ?? row.posted_date ?? row.created_at ?? null;
  if (v == null) return new Date().toISOString().slice(0, 10);
  if (typeof v === "string") {
    return v.includes("T") ? v.slice(0, 10) : v.slice(0, 10);
  }
  try {
    return new Date(v as string | number).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function normalizeJob(row: Record<string, unknown>): UiJob {
  const location = String(row.location ?? "");
  const locationTypeRaw = row.location_type ?? row.locationType;
  const locationType =
    typeof locationTypeRaw === "string" && locationTypeRaw.trim() !== ""
      ? locationTypeRaw
      : inferLocationType(location);

  const expRaw = row.experience;
  const experience =
    typeof expRaw === "string" && expRaw.trim() !== "" ? expRaw : "Mid";

  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    company: String(row.company ?? ""),
    location,
    locationType,
    salaryMin: Number(row.salary_min ?? row.salaryMin ?? 0),
    salaryMax: Number(row.salary_max ?? row.salaryMax ?? 0),
    jobType: String(row.job_type ?? row.jobType ?? "Full-time"),
    experience,
    posted: postedDateString(row),
  };
}

function jobMatchesSearch(job: UiJob, keywordRaw: string, locationRaw: string) {
  const keyword = keywordRaw.trim().toLowerCase();
  const loc = locationRaw.trim().toLowerCase();
  if (keyword) {
    const haystack = `${job.title} ${job.company}`.toLowerCase();
    const tokens = keyword.split(/\s+/).filter(Boolean);
    const keywordOk = tokens.every((t) => haystack.includes(t));
    if (!keywordOk) return false;
  }
  if (loc) {
    const locationHaystack = `${job.location} ${job.locationType}`.toLowerCase();
    if (!locationHaystack.includes(loc)) return false;
  }
  return true;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<UiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState("");
  const [userTitle, setUserTitle] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [jobType, setJobType] = useState("all");
  const [locationMode, setLocationMode] = useState("all");
  const [minSalary, setMinSalary] = useState(120000);
  const [experience, setExperience] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled && user) {
        setIsSignedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("skills, job_title")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled && profile) {
          setUserSkills(String(profile.skills ?? ""));
          setUserTitle(String(profile.job_title ?? ""));
        }
      }

      const { data, error } = await supabase.from("jobs").select("*");
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setJobs([]);
      } else {
        setJobs((data ?? []).map((row) => normalizeJob(row as Record<string, unknown>)));
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (!jobMatchesSearch(j, searchKeywords, searchLocation)) return false;
      if (jobType !== "all" && j.jobType !== jobType) return false;
      if (locationMode !== "all" && j.locationType !== locationMode) return false;
      if (experience !== "all" && j.experience !== experience) return false;
      if (j.salaryMax < minSalary) return false;
      return true;
    });
  }, [jobs, jobType, locationMode, minSalary, experience, searchKeywords, searchLocation]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "newest") {
      list.sort((a, b) => (a.posted < b.posted ? 1 : -1));
    } else if (sortBy === "salary-high") {
      list.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (sortBy === "salary-low") {
      list.sort((a, b) => a.salaryMin - b.salaryMin);
    } else if (sortBy === "company") {
      list.sort((a, b) => a.company.localeCompare(b.company));
    }
    return list;
  }, [filtered, sortBy]);

  const sliderMax = 350000;
  const sliderMin = 80000;

  const showEmptyFromFilters = !loading && !loadError && jobs.length > 0 && sorted.length === 0;
  const showEmptyTable = !loading && !loadError && jobs.length === 0;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] text-white shadow-sm sm:h-9 sm:w-9">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M7 12L10.5 15.5L17 9"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight text-[#1D9E75] sm:text-lg">
              Clearpost
            </span>
          </a>
          <nav className="flex items-center gap-3 text-sm">
            <a
              href="/"
              className="font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Home
            </a>
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <span className="font-semibold text-neutral-900">Jobs</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 lg:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Browse jobs
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Verified listings with salary on every role. Adjust filters to narrow
            results.
          </p>
        </div>

        {/* Search */}
        <section
          className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6"
          aria-label="Search jobs"
        >
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchKeywords((k) => k.trim());
              setSearchLocation((loc) => loc.trim());
            }}
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="search-keywords"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Job title or keywords
              </label>
              <input
                id="search-keywords"
                type="search"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="e.g. engineer, Stripe, product"
                autoComplete="off"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              />
            </div>
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <label
                htmlFor="search-location"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Location
              </label>
              <input
                id="search-location"
                type="search"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="City, remote, hybrid…"
                autoComplete="off"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              />
            </div>
            <div className="shrink-0 sm:w-auto">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] sm:w-auto"
              >
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Filter bar */}
        <section
          className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6"
          aria-label="Job filters"
        >
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-job-type"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Job type
              </label>
              <select
                id="filter-job-type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All types</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-location"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Location
              </label>
              <select
                id="filter-location"
                value={locationMode}
                onChange={(e) => setLocationMode(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All locations</option>
                {LOCATION_MODES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4">
              <label
                htmlFor="filter-salary"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Minimum salary
              </label>
              <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold tabular-nums text-[#1D9E75]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(minSalary)}
                  </span>
                  <span className="text-xs text-neutral-400">+</span>
                </div>
                <input
                  id="filter-salary"
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={5000}
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#1D9E75] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D9E75] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1D9E75]"
                />
                <div className="mt-1 flex justify-between text-xs text-neutral-400">
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                      notation: "compact",
                    }).format(sliderMin)}
                  </span>
                  <span>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                      notation: "compact",
                    }).format(sliderMax)}
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-experience"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Experience
              </label>
              <select
                id="filter-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All levels</option>
                {EXPERIENCE_LEVELS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setJobType("all");
                  setLocationMode("all");
                  setMinSalary(120000);
                  setExperience("all");
                  setSearchKeywords("");
                  setSearchLocation("");
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="order-2 shrink-0 lg:order-1 lg:w-56 xl:w-64">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Results
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">
                  {loading ? "…" : sorted.length}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {sorted.length === 1 ? "job matches" : "jobs match"} your filters
                </p>
              </div>
              <div className="border-t border-neutral-200 pt-5">
                <label
                  htmlFor="sort-jobs"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  Sort by
                </label>
                <select
                  id="sort-jobs"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="newest">Newest first</option>
                  <option value="salary-high">Salary (high to low)</option>
                  <option value="salary-low">Salary (low to high)</option>
                  <option value="company">Company (A–Z)</option>
                </select>
              </div>
            </div>
          </aside>

          <div className="order-1 min-w-0 flex-1 lg:order-2">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">Loading jobs…</p>
                <p className="mt-2 text-sm text-neutral-600">Fetching listings from the server.</p>
              </div>
            ) : loadError ? (
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/40 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">Could not load jobs</p>
                <p className="mt-2 text-sm text-neutral-600">{loadError}</p>
              </div>
            ) : showEmptyTable ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">No jobs found</p>
                <p className="mt-2 text-sm text-neutral-600">
                  There are no listings in the database yet. Check back soon.
                </p>
              </div>
            ) : showEmptyFromFilters ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  No jobs match these filters
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Try different search terms, widening salary range, or clearing
                  filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setJobType("all");
                    setLocationMode("all");
                    setMinSalary(80000);
                    setExperience("all");
                    setSearchKeywords("");
                    setSearchLocation("");
                  }}
                  className="mt-6 inline-flex rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {sorted.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      titleTag="h2"
                      matchScore={isSignedIn ? computeMatchScore(job, userSkills, userTitle) : null}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

