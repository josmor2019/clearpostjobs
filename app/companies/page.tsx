"use client";

import { useMemo, useState } from "react";

type Company = {
  id: string;
  name: string;
  initials: string;
  logoBg: string;
  industry: string;
  sizeLabel: string;
  sizeBucket: "1-500" | "501-5000" | "5001+";
  openJobs: number;
  openInternships: number;
};

const COMPANIES: Company[] = [
  {
    id: "stripe",
    name: "Stripe",
    initials: "ST",
    logoBg: "bg-[#635bff]",
    industry: "Fintech",
    sizeLabel: "8,000 employees",
    sizeBucket: "5001+",
    openJobs: 12,
    openInternships: 4,
  },
  {
    id: "google",
    name: "Google",
    initials: "G",
    logoBg: "bg-[#1a73e8]",
    industry: "Technology",
    sizeLabel: "180,000 employees",
    sizeBucket: "5001+",
    openJobs: 45,
    openInternships: 12,
  },
  {
    id: "airbnb",
    name: "Airbnb",
    initials: "AB",
    logoBg: "bg-[#ff385c]",
    industry: "Travel",
    sizeLabel: "6,000 employees",
    sizeBucket: "5001+",
    openJobs: 8,
    openInternships: 3,
  },
  {
    id: "meta",
    name: "Meta",
    initials: "M",
    logoBg: "bg-[#0866ff]",
    industry: "Technology",
    sizeLabel: "85,000 employees",
    sizeBucket: "5001+",
    openJobs: 23,
    openInternships: 6,
  },
  {
    id: "notion",
    name: "Notion",
    initials: "N",
    logoBg: "bg-[#111111]",
    industry: "Productivity",
    sizeLabel: "500 employees",
    sizeBucket: "1-500",
    openJobs: 6,
    openInternships: 2,
  },
  {
    id: "figma",
    name: "Figma",
    initials: "FG",
    logoBg: "bg-[#a259ff]",
    industry: "Design",
    sizeLabel: "1,000 employees",
    sizeBucket: "501-5000",
    openJobs: 9,
    openInternships: 3,
  },
];

const INDUSTRIES = [
  "Fintech",
  "Technology",
  "Travel",
  "Productivity",
  "Design",
] as const;

const SIZE_OPTIONS = [
  { value: "1-500", label: "1-500 employees" },
  { value: "501-5000", label: "501-5,000 employees" },
  { value: "5001+", label: "5,001+ employees" },
] as const;

function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${company.logoBg}`}
          aria-hidden
        >
          {company.initials}
        </div>
        <span className="shrink-0 rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#188a66]">
          Verified
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-neutral-900">{company.name}</h2>

      <div className="mt-3">
        <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
          {company.industry}
        </span>
      </div>

      <p className="mt-4 text-sm text-neutral-600">{company.sizeLabel}</p>
      <p className="mt-2 text-sm font-semibold text-[#1D9E75]">
        {company.openJobs} open jobs
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        {company.openInternships} internships
      </p>

      <div className="mt-auto pt-5">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-xl border border-[#1D9E75]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-[#1D9E75]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
        >
          View company
        </button>
      </div>
    </article>
  );
}

export default function CompaniesPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [size, setSize] = useState("all");

  const filtered = useMemo(() => {
    return COMPANIES.filter((company) => {
      const matchesQuery =
        query.trim().length === 0 ||
        company.name.toLowerCase().includes(query.toLowerCase());
      const matchesIndustry = industry === "all" || company.industry === industry;
      const matchesSize = size === "all" || company.sizeBucket === size;
      return matchesQuery && matchesIndustry && matchesSize;
    });
  }, [query, industry, size]);

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
          <a
            href="/jobs"
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Browse Jobs
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 lg:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Top companies hiring now
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Verified employers actively posting jobs on Clearpost
          </p>
        </div>

        <section
          className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6"
          aria-label="Search companies"
        >
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="company-search" className="sr-only">
              Search companies
            </label>
            <input
              id="company-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              className="min-h-11 w-full flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none ring-0 placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
            >
              Search
            </button>
          </form>
        </section>

        <section
          className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6"
          aria-label="Company filters"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="industry-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Industry
              </label>
              <select
                id="industry-filter"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All industries</option>
                {INDUSTRIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="size-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Size
              </label>
              <select
                id="size-filter"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All sizes</option>
                {SIZE_OPTIONS.map((value) => (
                  <option key={value.value} value={value.value}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setIndustry("all");
                  setSize("all");
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <p className="mb-6 text-sm text-neutral-600">
          <span className="font-semibold tabular-nums text-neutral-900">
            {filtered.length}
          </span>{" "}
          companies on Clearpost
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              No companies match these filters
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              Try adjusting your search or clearing filters.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <li key={company.id}>
                <CompanyCard company={company} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

