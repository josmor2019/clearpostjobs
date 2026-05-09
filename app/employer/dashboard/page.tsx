"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  created_at: string;
  employer_id?: string;
  user_id?: string;
  _appCount?: number;
};

type Applicant = {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_at: string;
  cover_note: string | null;
  resume_url: string | null;
  applicant_name: string;
  job_title: string;
};

const STATUS_LABELS: Record<string, string> = {
  applied: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  rejected: "Rejected",
  offered: "Offered",
  hired: "Hired",
};

const STATUS_CLASSES: Record<string, string> = {
  applied: "bg-neutral-100 text-neutral-700",
  reviewing: "bg-blue-100 text-blue-700",
  interview: "bg-[#1D9E75]/15 text-[#188a66]",
  rejected: "bg-red-100 text-red-600",
  offered: "bg-purple-100 text-purple-700",
  hired: "bg-emerald-100 text-emerald-700",
};

function jobStatusClasses(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "active" || s === "published" || s === "open") return "bg-[#1D9E75]/15 text-[#188a66]";
  if (s === "paused" || s === "draft") return "bg-amber-100 text-amber-800";
  if (s === "expired" || s === "closed" || s === "filled") return "bg-neutral-100 text-neutral-700";
  return "bg-[#1D9E75]/15 text-[#188a66]";
}

function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "CP";
}

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
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
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [listings, setListings] = useState<JobRow[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [totalApplications, setTotalApplications] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [responseRate, setResponseRate] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { user: nextUser } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!nextUser) { router.replace("/employer/sign-in"); return; }
      setUser(nextUser);

      // Fetch jobs owned by this employer
      const { data: jobData, error: jobErr } = await supabase
        .from("jobs")
        .select("id, title, company, location, status, created_at, employer_id, user_id")
        .or(`employer_id.eq.${nextUser.id},user_id.eq.${nextUser.id}`)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (jobErr) {
        setJobsError(jobErr.message);
        setAuthChecked(true);
        return;
      }

      const myJobs = (jobData ?? []) as JobRow[];
      setListings(myJobs);

      // Fetch all applications for these jobs via the authenticated API route
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        try {
          const res = await fetch("/api/employer/applicants", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const body = (await res.json()) as { applicants?: Applicant[] };
            const apps = body.applicants ?? [];

            // Build per-job application count map
            const countMap: Record<string, number> = {};
            for (const a of apps) {
              const jid = String(a.job_id);
              countMap[jid] = (countMap[jid] ?? 0) + 1;
            }

            if (!cancelled) {
              setListings(myJobs.map((r) => ({ ...r, _appCount: countMap[r.id] ?? 0 })));
              setApplicants(apps.slice(0, 10));
              setTotalApplications(apps.length);
              setInterviewCount(
                apps.filter((a) =>
                  a.status === "interview" || a.status === "offered" || a.status === "hired",
                ).length,
              );
              const responded = apps.filter((a) => a.status !== "applied").length;
              setResponseRate(apps.length > 0 ? Math.round((responded / apps.length) * 100) : null);
            }
          }
        } catch {
          // Silently fail — jobs table still shows, just with 0 app counts
        }
      }

      if (!cancelled) setAuthChecked(true);
    }

    void init();
    return () => { cancelled = true; };
  }, [router]);

  const activeListings = useMemo(
    () =>
      listings.filter((r) => {
        const s = (r.status ?? "").toLowerCase();
        return s === "active" || s === "published" || s === "open";
      }).length,
    [listings],
  );

  const companyName = useMemo(() => {
    const fromMeta = user?.user_metadata?.company_name;
    if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
    if (user?.email) return user.email.split("@")[1] ?? "your company";
    return "your company";
  }, [user]);

  const newApplicantCount = useMemo(
    () => applicants.filter((a) => a.status === "applied").length,
    [applicants],
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/employer/sign-in");
  }, [router]);

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/employer/applicants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        setApplicants((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
        // Update counts
        const updated = applicants.map((a) => (a.id === applicationId ? { ...a, status } : a));
        const responded = updated.filter((a) => a.status !== "applied").length;
        setResponseRate(updated.length > 0 ? Math.round((responded / updated.length) * 100) : null);
        setInterviewCount(
          updated.filter((a) =>
            a.status === "interview" || a.status === "offered" || a.status === "hired",
          ).length,
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (!authChecked || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-600">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">C</span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
        </a>
        <nav className="space-y-1">
          <NavLink href="/employer/dashboard" label="Dashboard" active />
          <NavLink href="/employer/post-job" label="Post a Job" />
          <NavLink href="/employer/applicants" label="Applicants" />
          <NavLink href="/employer/messages" label="Messages" />
          <NavLink href="/employer/settings" label="Settings" />
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
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Welcome back, {companyName}
            </h1>
            <div className="flex items-center gap-3">
              <a
                href="/employer/messages"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Messages"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M15 17H9m9-1V11a6 6 0 10-12 0v5l-2 2h16l-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {newApplicantCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {newApplicantCount}
                  </span>
                )}
              </a>
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

          {/* Stats */}
          <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Active Listings", value: String(activeListings) },
              { label: "Total Applications", value: String(totalApplications) },
              { label: "Interviews / Offers", value: String(interviewCount) },
              { label: "Response Rate", value: responseRate !== null ? `${responseRate}%` : "—" },
            ].map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{stat.value}</p>
              </article>
            ))}
          </section>

          {/* Job Listings */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">My Job Listings</h2>
              <p className="text-sm text-neutral-500">
                {listings.length} listing{listings.length !== 1 ? "s" : ""}
              </p>
            </div>
            {jobsError && (
              <p className="mb-3 text-sm font-medium text-red-600" role="alert">
                Could not load jobs: {jobsError}
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    {["Title", "Location", "Applications", "Status", "Posted", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm text-neutral-500">
                        No listings yet.{" "}
                        <a href="/employer/post-job" className="font-semibold text-[#1D9E75] hover:text-[#188a66]">
                          Post a job
                        </a>{" "}
                        to see it here.
                      </td>
                    </tr>
                  ) : (
                    listings.map((job) => (
                      <tr key={job.id}>
                        <td className="px-3 py-3 font-medium text-neutral-900">{job.title}</td>
                        <td className="px-3 py-3 text-neutral-600">{job.location ?? "—"}</td>
                        <td className="px-3 py-3 tabular-nums text-neutral-600">{job._appCount ?? 0}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${jobStatusClasses(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-500">
                          {job.created_at
                            ? new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex gap-1">
                            <a href={`/jobs/${job.id}`} className="rounded px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100">
                              View
                            </a>
                            <a href={`/employer/edit-job/${job.id}`} className="rounded px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100">
                              Edit
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Applicants */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Recent Applicants</h2>
                <p className="text-sm text-neutral-500">Latest candidates across your roles</p>
              </div>
              <a href="/employer/applicants" className="text-sm font-medium text-[#1D9E75] hover:text-[#188a66]">
                View all →
              </a>
            </div>

            {applicants.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-500">No applicants yet.</p>
                <p className="mt-1 text-sm text-neutral-400">
                  Post a job to start receiving applications.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
                  <thead className="bg-neutral-50">
                    <tr>
                      {["Applicant", "Role", "Applied", "Status", "Resume", "Update Status"].map((h) => (
                        <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {applicants.map((a) => (
                      <tr key={a.id}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/10 text-xs font-bold text-[#188a66]">
                              {a.applicant_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-neutral-900">{a.applicant_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-neutral-600">{a.job_title}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-500">
                          {new Date(a.applied_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[a.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                            {STATUS_LABELS[a.status] ?? a.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {a.resume_url ? (
                            <a
                              href={a.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-[#1D9E75] hover:underline"
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={a.status}
                            disabled={updatingId === a.id}
                            onChange={(e) => void updateStatus(a.id, e.target.value)}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none disabled:opacity-50"
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
