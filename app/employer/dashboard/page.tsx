"use client";

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type JobRow = Record<string, unknown>;

function jobStatusClasses(status: string) {
  const s = status.toLowerCase();
  if (s === "active" || s === "published" || s === "open") {
    return "bg-[#1D9E75]/15 text-[#188a66]";
  }
  if (s === "paused" || s === "draft") {
    return "bg-amber-100 text-amber-800";
  }
  if (s === "closed" || s === "filled") {
    return "bg-neutral-100 text-neutral-700";
  }
  return "bg-[#1D9E75]/15 text-[#188a66]";
}

function rowStatus(row: JobRow): string {
  const raw = row.status ?? row.listing_status ?? "Active";
  const s = String(raw);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function rowApplications(row: JobRow): number {
  const n =
    row.application_count ??
    row.applications ??
    row.applicants ??
    row.applicationCount;
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function rowPostedDate(row: JobRow): string {
  const v =
    row.posted_at ?? row.posted ?? row.posted_date ?? row.created_at ?? null;
  if (v == null) return "—";
  try {
    const d = new Date(v as string | number);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function rowViews(row: JobRow): number {
  const n = row.profile_views ?? row.views ?? row.view_count;
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function rowInterviews(row: JobRow): number {
  const n = row.interviews_scheduled ?? row.interviews_count ?? row.interviews;
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function isActiveStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s !== "paused" && s !== "closed" && s !== "draft" && s !== "filled";
}

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "CP";
}

function filterEmployerJobs(rows: JobRow[], user: User): JobRow[] {
  const uid = user.id;
  const company = String(user.user_metadata?.company_name ?? "")
    .trim()
    .toLowerCase();

  return rows.filter((r) => {
    const emp = r.employer_id ?? r.user_id ?? r.posted_by ?? r.created_by;
    if (emp != null && String(emp) === uid) return true;
    if (company && String(r.company ?? "").trim().toLowerCase() === company) {
      return true;
    }
    return false;
  });
}

function NavLink({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[#1D9E75]/10 text-[#188a66]"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      {label}
    </a>
  );
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [listings, setListings] = useState<JobRow[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user: nextUser },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!nextUser) {
        router.replace("/employer/sign-in");
        return;
      }

      setUser(nextUser);

      const { data, error } = await supabase.from("jobs").select("*");
      if (cancelled) return;

      if (error) {
        setJobsError(error.message);
        setListings([]);
      } else {
        setJobsError(null);
        const rows = (data ?? []) as JobRow[];
        setListings(filterEmployerJobs(rows, nextUser));
      }

      setAuthChecked(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const companyName = useMemo(() => {
    const meta = user?.user_metadata as Record<string, unknown> | undefined;
    const fromMeta = meta?.company_name;
    if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
    if (user?.email) return user.email.split("@")[1] ?? "your company";
    return "your company";
  }, [user]);

  const stats = useMemo(() => {
    const active = listings.filter((r) => isActiveStatus(rowStatus(r))).length;
    const applications = listings.reduce((s, r) => s + rowApplications(r), 0);
    const views = listings.reduce((s, r) => s + rowViews(r), 0);
    const interviews = listings.reduce((s, r) => s + rowInterviews(r), 0);
    return {
      activeListings: active,
      totalApplications: applications,
      profileViews: views,
      interviewsScheduled: interviews,
    };
  }, [listings]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/employer/sign-in");
  }, [router]);

  if (!authChecked || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-600">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">
            Clearpost
          </span>
        </a>

        <nav className="space-y-1">
          <NavLink href="/employer/dashboard" label="Dashboard" active />
          <NavLink href="/employer/post-job" label="Post a Job" />
          <NavLink href="/employer/dashboard#my-job-listings" label="My Listings" />
          <NavLink href="/employer/dashboard#candidates" label="Candidates" />
          <NavLink href="/employer/dashboard#settings" label="Settings" />
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            Sign out
          </button>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
                Welcome back, {companyName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Notifications"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M15 17H9m9-1V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-xs font-bold text-[#188a66]">
                {companyInitials(companyName)}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="flex justify-end">
            <a
              href="/employer/post-job"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] sm:w-auto"
            >
              Post a Job
            </a>
          </div>

          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active Listings",
                value: String(stats.activeListings),
                icon: "list" as const,
              },
              {
                label: "Total Applications",
                value: String(stats.totalApplications),
                icon: "people" as const,
              },
              {
                label: "Profile Views",
                value: String(stats.profileViews),
                icon: "eye" as const,
              },
              {
                label: "Interviews Scheduled",
                value: String(stats.interviewsScheduled),
                icon: "calendar" as const,
              },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
                      {stat.value}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/12 text-[#1D9E75]">
                    {stat.icon === "list" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "people" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "eye" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    ) : null}
                    {stat.icon === "calendar" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M7 3v3M17 3v3M4 8h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 12h8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </div>
              </article>
            ))}
          </section>

          <section
            id="my-job-listings"
            className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">My Job Listings</h2>
                <p className="text-sm text-neutral-500">
                  Jobs associated with your account or company name
                </p>
              </div>
            </div>
            {jobsError ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                Could not load jobs: {jobsError}
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Job Title
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Location
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Applications
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Posted Date
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {listings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-8 text-center text-sm text-neutral-500"
                      >
                        No listings yet.{" "}
                        <a href="/employer/post-job" className="font-semibold text-[#1D9E75] hover:text-[#188a66]">
                          Post a job
                        </a>{" "}
                        to see it here.
                      </td>
                    </tr>
                  ) : (
                    listings.map((row, idx) => {
                      const rowKey = String(row.id ?? `row-${idx}`);
                      const jobId = row.id != null ? String(row.id) : null;
                      const title = String(row.title ?? "—");
                      const location = String(row.location ?? "—");
                      const applications = rowApplications(row);
                      const status = rowStatus(row);
                      const posted = rowPostedDate(row);
                      return (
                        <tr key={rowKey}>
                          <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-neutral-900">
                            {title}
                          </td>
                          <td className="px-3 py-3 text-sm text-neutral-600">{location}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-neutral-600">
                            {applications}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${jobStatusClasses(
                                status,
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-600">
                            {posted}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            {jobId ? (
                              <a
                                href={`/employer/edit-job/${jobId}`}
                                className="inline-flex rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                              >
                                Edit
                              </a>
                            ) : (
                              <span className="text-xs text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section id="candidates" className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Candidates</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Candidate tools will appear here. For now, review applications from your job
              listings.
            </p>
          </section>

          <section id="settings" className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Company and notification settings will live here.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

