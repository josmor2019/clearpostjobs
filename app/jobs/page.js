"use client";

import { useMemo, useState } from "react";

const JOBS = [
  {
    id: "1",
    company: "Stripe",
    title: "Software Engineer, Payments Platform",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salaryMin: 198000,
    salaryMax: 265000,
    jobType: "Full-time",
    experience: "Senior",
    posted: "2026-04-14",
  },
  {
    id: "2",
    company: "Notion",
    title: "Product Engineer, Growth",
    location: "Remote (US)",
    locationType: "Remote",
    salaryMin: 175000,
    salaryMax: 230000,
    jobType: "Full-time",
    experience: "Mid",
    posted: "2026-04-13",
  },
  {
    id: "3",
    company: "Vercel",
    title: "Developer Experience Engineer",
    location: "Remote (Global)",
    locationType: "Remote",
    salaryMin: 160000,
    salaryMax: 210000,
    jobType: "Full-time",
    experience: "Mid",
    posted: "2026-04-12",
  },
  {
    id: "4",
    company: "Linear",
    title: "Staff Frontend Engineer",
    location: "San Francisco, CA",
    locationType: "On-site",
    salaryMin: 220000,
    salaryMax: 290000,
    jobType: "Full-time",
    experience: "Staff",
    posted: "2026-04-11",
  },
  {
    id: "5",
    company: "Figma",
    title: "Software Engineer, Editor Performance",
    location: "New York, NY",
    locationType: "Hybrid",
    salaryMin: 185000,
    salaryMax: 245000,
    jobType: "Full-time",
    experience: "Senior",
    posted: "2026-04-10",
  },
  {
    id: "6",
    company: "Anthropic",
    title: "Machine Learning Engineer, Inference",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salaryMin: 240000,
    salaryMax: 320000,
    jobType: "Contract",
    experience: "Senior",
    posted: "2026-04-09",
  },
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract"];
const LOCATION_MODES = ["Remote", "On-site", "Hybrid"];
const EXPERIENCE_LEVELS = ["Entry", "Mid", "Senior", "Staff"];

function formatSalary(min, max) {
  const fmt = (n) =>
    n >= 1000
      ? `$${Math.round(n / 1000)}k`
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

function formatPosted(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobsPage() {
  const [jobType, setJobType] = useState("all");
  const [locationMode, setLocationMode] = useState("all");
  const [minSalary, setMinSalary] = useState(120000);
  const [experience, setExperience] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    return JOBS.filter((j) => {
      if (jobType !== "all" && j.jobType !== jobType) return false;
      if (locationMode !== "all" && j.locationType !== locationMode)
        return false;
      if (experience !== "all" && j.experience !== experience) return false;
      if (j.salaryMax < minSalary) return false;
      return true;
    });
  }, [jobType, locationMode, minSalary, experience]);

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
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Sidebar: below grid on small screens, left rail on large */}
          <aside className="order-2 shrink-0 lg:order-1 lg:w-56 xl:w-64">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Results
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">
                  {sorted.length}
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

          {/* Job grid */}
          <div className="order-1 min-w-0 flex-1 lg:order-2">
            {sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  No jobs match these filters
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Try widening salary range or clearing filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setJobType("all");
                    setLocationMode("all");
                    setMinSalary(80000);
                    setExperience("all");
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
                    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {job.company}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#188a66]">
                          Verified
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold leading-snug text-neutral-900">
                        {job.title}
                      </h2>
                      <p className="mt-2 text-sm text-neutral-600">
                        {job.location}
                      </p>
                      <p className="mt-3 text-base font-semibold text-[#1D9E75]">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
                          {job.jobType}
                        </span>
                        <span className="inline-flex rounded-lg border border-neutral-100 bg-white px-2.5 py-1 text-xs text-neutral-500">
                          {job.locationType}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-neutral-400">
                        Posted {formatPosted(job.posted)}
                      </p>
                      <div className="mt-auto flex pt-5">
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
                        >
                          Apply
                        </button>
                      </div>
                    </article>
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
