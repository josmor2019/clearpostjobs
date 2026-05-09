"use client";

import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Company = {
  name: string;
  initials: string;
  openJobs: number;
};

const LOGO_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
];

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_COLORS[h % LOGO_COLORS.length]!;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function CompanyCard({ company }: { company: Company }) {
  const color = hashColor(company.name);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:border-neutral-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color}`}
          aria-hidden
        >
          {company.initials}
        </div>
        <span className="shrink-0 rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#188a66]">
          Hiring
        </span>
      </div>

      <h2 className="mt-4 text-lg font-bold text-neutral-900">{company.name}</h2>

      <p className="mt-3 text-sm font-semibold text-[#1D9E75]">
        {company.openJobs} open {company.openJobs === 1 ? "job" : "jobs"}
      </p>

      <div className="mt-auto pt-5">
        <a
          href={`/jobs?q=${encodeURIComponent(company.name)}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[#1D9E75]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-[#1D9E75]/5"
        >
          View jobs
        </a>
      </div>
    </article>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("jobs")
        .select("company")
        .eq("status", "active")
        .not("company", "is", null);

      if (error || !data) { setLoading(false); return; }

      const counts: Record<string, number> = {};
      for (const row of data) {
        const name = String(row.company ?? "").trim();
        if (!name) continue;
        counts[name] = (counts[name] ?? 0) + 1;
      }

      const list: Company[] = Object.entries(counts)
        .map(([name, openJobs]) => ({ name, initials: getInitials(name), openJobs }))
        .sort((a, b) => b.openJobs - a.openJobs || a.name.localeCompare(b.name));

      setCompanies(list);
      setLoading(false);
    }

    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] text-white shadow-sm sm:h-9 sm:w-9">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight text-[#1D9E75] sm:text-lg">Clearpost</span>
          </a>
          <a href="/jobs" className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900">
            Browse Jobs
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 lg:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Companies hiring now
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Employers actively posting jobs on Clearpost
          </p>
        </div>

        <section className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-6" aria-label="Search companies">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="company-search" className="sr-only">Search companies</label>
            <input
              id="company-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              className="min-h-11 w-full flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66]"
            >
              Search
            </button>
          </form>
        </section>

        {loading ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-neutral-900">
              {companies.length === 0 ? "No companies hiring yet" : "No companies match your search"}
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              {companies.length === 0
                ? "Check back when employers start posting jobs."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-neutral-600">
              <span className="font-semibold tabular-nums text-neutral-900">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "company" : "companies"} on Clearpost
            </p>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((company) => (
                <li key={company.name}>
                  <CompanyCard company={company} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
