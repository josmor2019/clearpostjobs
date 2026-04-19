"use client";

import { useMemo, useState } from "react";

type SalaryRow = {
  id: string;
  title: string;
  industry: string;
  experience: string;
  location: string;
  range: string;
  avgSalary: number;
  avgSalaryLabel: string;
};

const SALARY_DATA: SalaryRow[] = [
  {
    id: "software-engineer-mid-remote",
    title: "Software Engineer",
    industry: "Technology",
    experience: "Mid-level",
    location: "Remote",
    range: "$120k-$180k",
    avgSalary: 150000,
    avgSalaryLabel: "$150k",
  },
  {
    id: "product-manager-senior-sf",
    title: "Product Manager",
    industry: "Technology",
    experience: "Senior",
    location: "San Francisco",
    range: "$140k-$200k",
    avgSalary: 170000,
    avgSalaryLabel: "$170k",
  },
  {
    id: "data-scientist-mid-ny",
    title: "Data Scientist",
    industry: "Technology",
    experience: "Mid-level",
    location: "New York",
    range: "$110k-$160k",
    avgSalary: 135000,
    avgSalaryLabel: "$135k",
  },
  {
    id: "staff-engineer-remote",
    title: "Staff Engineer",
    industry: "Technology",
    experience: "Staff",
    location: "Remote",
    range: "$200k-$285k",
    avgSalary: 242000,
    avgSalaryLabel: "$242k",
  },
  {
    id: "ux-designer-mid-remote",
    title: "UX Designer",
    industry: "Design",
    experience: "Mid-level",
    location: "Remote",
    range: "$90k-$130k",
    avgSalary: 110000,
    avgSalaryLabel: "$110k",
  },
  {
    id: "devops-engineer-senior-austin",
    title: "DevOps Engineer",
    industry: "Technology",
    experience: "Senior",
    location: "Austin",
    range: "$130k-$175k",
    avgSalary: 152000,
    avgSalaryLabel: "$152k",
  },
  {
    id: "marketing-manager-senior-chicago",
    title: "Marketing Manager",
    industry: "Marketing",
    experience: "Senior",
    location: "Chicago",
    range: "$85k-$120k",
    avgSalary: 102000,
    avgSalaryLabel: "$102k",
  },
  {
    id: "financial-analyst-mid-ny",
    title: "Financial Analyst",
    industry: "Finance",
    experience: "Mid-level",
    location: "New York",
    range: "$80k-$115k",
    avgSalary: 97000,
    avgSalaryLabel: "$97k",
  },
  {
    id: "sales-engineer-senior-remote",
    title: "Sales Engineer",
    industry: "Sales",
    experience: "Senior",
    location: "Remote",
    range: "$120k-$160k",
    avgSalary: 140000,
    avgSalaryLabel: "$140k",
  },
  {
    id: "frontend-engineer-junior-remote",
    title: "Frontend Engineer",
    industry: "Technology",
    experience: "Junior",
    location: "Remote",
    range: "$70k-$100k",
    avgSalary: 85000,
    avgSalaryLabel: "$85k",
  },
];

const INDUSTRIES = ["Technology", "Design", "Marketing", "Finance", "Sales"] as const;
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior", "Staff"] as const;
const LOCATIONS = ["Remote", "San Francisco", "New York", "Austin", "Chicago"] as const;

export default function SalaryGuidePage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [experience, setExperience] = useState("all");
  const [location, setLocation] = useState("all");

  const filteredRows = useMemo(() => {
    return SALARY_DATA.filter((row) => {
      const normalized = query.trim().toLowerCase();
      const matchesQuery =
        normalized.length === 0 || row.title.toLowerCase().includes(normalized);
      const matchesIndustry = industry === "all" || row.industry === industry;
      const matchesExperience =
        experience === "all" || row.experience === experience;
      const matchesLocation = location === "all" || row.location === location;
      return (
        matchesQuery && matchesIndustry && matchesExperience && matchesLocation
      );
    });
  }, [query, industry, experience, location]);

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
            Salary Guide
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Real salary data from verified job listings on Clearpost
          </p>
        </div>

        <section
          className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6"
          aria-label="Search salary data"
        >
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="salary-search" className="sr-only">
              Search job titles
            </label>
            <input
              id="salary-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job titles..."
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
          aria-label="Salary filters"
        >
          <div className="grid gap-4 sm:grid-cols-4">
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
                htmlFor="experience-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Experience
              </label>
              <select
                id="experience-filter"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All levels</option>
                {EXPERIENCE_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Location
              </label>
              <select
                id="location-filter"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
              >
                <option value="all">All locations</option>
                {LOCATIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
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
                  setExperience("all");
                  setLocation("all");
                }}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3" aria-label="Summary stats">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Average salary
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-[#1D9E75]">
              $142k
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Highest paying role
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-neutral-900">
              Staff Engineer
            </p>
            <p className="mt-1 text-sm font-semibold text-[#1D9E75]">$285k</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Most in demand
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-neutral-900">
              Software Engineer
            </p>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
          aria-label="Salary table"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Experience Level
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Salary Range
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Avg Salary
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/70">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-neutral-900">
                      {row.title}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                      {row.industry}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                      {row.experience}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-600">
                      {row.location}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-700">
                      {row.range}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#1D9E75]">
                      {row.avgSalaryLabel}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <a
                        href="/jobs"
                        className="font-semibold text-[#1D9E75] hover:text-[#188a66]"
                      >
                        View jobs
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 ? (
            <div className="border-t border-neutral-200 px-4 py-10 text-center">
              <p className="text-sm text-neutral-600">
                No salary rows match your current filters.
              </p>
            </div>
          ) : null}
        </section>

        <p className="mt-5 text-xs text-neutral-500">
          Salary data is sourced from verified employer listings on Clearpost
        </p>
      </main>
    </div>
  );
}

