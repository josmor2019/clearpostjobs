"use client";

import { useMemo, useState } from "react";

type Internship = {
  id: string;
  company: string;
  initials: string;
  logoBg: string; // Tailwind arbitrary color class, e.g. "bg-[#635bff]"
  title: string;
  industry: string;
  location: string;
  locationMode: "Remote" | "On-site" | "Hybrid";
  duration: string;
  experience: "Student" | "Junior" | "All";
  stipendMinMonthly: number;
  stipendMaxMonthly: number;
  posted: string; // ISO date
};

const INTERNSHIPS: Internship[] = [
  {
    id: "stripe-se-intern",
    company: "Stripe",
    initials: "ST",
    logoBg: "bg-[#635bff]",
    title: "Software Engineering Intern",
    industry: "Engineering",
    location: "San Francisco, CA",
    locationMode: "On-site",
    duration: "12 weeks",
    experience: "Student",
    stipendMinMonthly: 8000,
    stipendMaxMonthly: 8000,
    posted: "2026-04-14",
  },
  {
    id: "google-pm-intern",
    company: "Google",
    initials: "G",
    logoBg: "bg-[#1a73e8]",
    title: "Product Management Intern",
    industry: "Product",
    location: "Mountain View, CA",
    locationMode: "On-site",
    duration: "12 weeks",
    experience: "Student",
    stipendMinMonthly: 9000,
    stipendMaxMonthly: 9000,
    posted: "2026-04-13",
  },
  {
    id: "airbnb-design-intern",
    company: "Airbnb",
    initials: "AB",
    logoBg: "bg-[#ff385c]",
    title: "Design Intern",
    industry: "Design",
    location: "Remote (US)",
    locationMode: "Remote",
    duration: "10 weeks",
    experience: "Student",
    stipendMinMonthly: 7000,
    stipendMaxMonthly: 7000,
    posted: "2026-04-12",
  },
  {
    id: "meta-ds-intern",
    company: "Meta",
    initials: "M",
    logoBg: "bg-[#0866ff]",
    title: "Data Science Intern",
    industry: "Data",
    location: "New York, NY",
    locationMode: "Hybrid",
    duration: "12 weeks",
    experience: "Student",
    stipendMinMonthly: 8500,
    stipendMaxMonthly: 8500,
    posted: "2026-04-11",
  },
];

const INDUSTRIES = ["Engineering", "Product", "Design", "Data"] as const;
const LOCATIONS = ["Remote", "On-site", "Hybrid"] as const;
const DURATIONS = ["10 weeks", "12 weeks"] as const;
const EXPERIENCE_LEVELS = ["Student", "Junior"] as const;

function formatStipend(minMonthly: number, maxMonthly: number) {
  const fmt = (n: number) => `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  if (minMonthly === maxMonthly) return `${fmt(minMonthly)}/mo`;
  return `${fmt(minMonthly)} – ${fmt(maxMonthly)}/mo`;
}

function formatPosted(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${internship.logoBg}`}
            aria-hidden
          >
            {internship.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {internship.company}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#188a66]">
          Verified
        </span>
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug text-neutral-900">
        {internship.title}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {internship.locationMode}
        </span>
        <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {internship.duration}
        </span>
      </div>

      <p className="mt-4 text-base font-semibold text-[#1D9E75]">
        {formatStipend(internship.stipendMinMonthly, internship.stipendMaxMonthly)}
      </p>
      <p className="mt-2 text-xs text-neutral-400">
        Posted {formatPosted(internship.posted)}
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
  );
}

export default function InternshipsPage() {
  const [industry, setIndustry] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [duration, setDuration] = useState<string>("all");
  const [experience, setExperience] = useState<string>("all");
  const [minStipend, setMinStipend] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("newest");

  const sliderMin = 0;
  const sliderMax = 50000;

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter((i) => {
      if (industry !== "all" && i.industry !== industry) return false;
      if (location !== "all" && i.locationMode !== location) return false;
      if (duration !== "all" && i.duration !== duration) return false;
      if (experience !== "all" && i.experience !== experience) return false;
      if (i.stipendMaxMonthly < minStipend) return false;
      return true;
    });
  }, [industry, location, duration, experience, minStipend]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "newest") {
      list.sort((a, b) => (a.posted < b.posted ? 1 : -1));
    } else if (sortBy === "stipend-high") {
      list.sort((a, b) => b.stipendMaxMonthly - a.stipendMaxMonthly);
    } else if (sortBy === "stipend-low") {
      list.sort((a, b) => a.stipendMinMonthly - b.stipendMinMonthly);
    } else if (sortBy === "company") {
      list.sort((a, b) => a.company.localeCompare(b.company));
    }
    return list;
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
            <span className="font-semibold text-neutral-900">Internships</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header section */}
        <div className="mb-8 lg:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Browse internships
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Verified internships with stipend shown upfront
          </p>
        </div>

        {/* Filter bar */}
        <section
          className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6"
          aria-label="Internship filters"
        >
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-2">
              <label
                htmlFor="filter-industry"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Industry
              </label>
              <select
                id="filter-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All industries</option>
                {INDUSTRIES.map((x) => (
                  <option key={x} value={x}>
                    {x}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All locations</option>
                {LOCATIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="filter-duration"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Duration
              </label>
              <select
                id="filter-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All durations</option>
                {DURATIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label
                htmlFor="filter-stipend"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Minimum stipend (monthly)
              </label>
              <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold tabular-nums text-[#1D9E75]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(minStipend)}
                  </span>
                  <span className="text-xs text-neutral-400">/mo+</span>
                </div>
                <input
                  id="filter-stipend"
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={500}
                  value={minStipend}
                  onChange={(e) => setMinStipend(Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#1D9E75] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D9E75] [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#1D9E75]"
                />
                <div className="mt-1 flex justify-between text-xs text-neutral-400">
                  <span>$0</span>
                  <span>$50k</span>
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
                {EXPERIENCE_LEVELS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end lg:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setIndustry("all");
                  setLocation("all");
                  setDuration("all");
                  setExperience("all");
                  setMinStipend(0);
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Results + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900 tabular-nums">
              {sorted.length}
            </span>{" "}
            internships match your filters
          </p>
          <div className="flex items-center gap-3">
            <label
              htmlFor="sort-internships"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              Sort
            </label>
            <select
              id="sort-internships"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
            >
              <option value="newest">Newest first</option>
              <option value="stipend-high">Stipend (high to low)</option>
              <option value="stipend-low">Stipend (low to high)</option>
              <option value="company">Company (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              No internships match these filters
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Try lowering the stipend minimum or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setIndustry("all");
                setLocation("all");
                setDuration("all");
                setExperience("all");
                setMinStipend(0);
              }}
              className="mt-6 inline-flex rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((internship) => (
              <li key={internship.id}>
                <InternshipCard internship={internship} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

