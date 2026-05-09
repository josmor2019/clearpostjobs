"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[#1D9E75]/10 text-[#188a66]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`}>
      {label}
    </a>
  );
}

export default function EmployerApplicantsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filtered, setFiltered] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/employer/sign-in"); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/employer/sign-in"); return; }

      try {
        const res = await fetch("/api/employer/applicants", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to load applicants.");
        const body = (await res.json()) as { applicants?: Applicant[] };
        if (!cancelled) {
          const apps = body.applicants ?? [];
          setApplicants(apps);
          setFiltered(apps);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load applicants.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    let result = applicants;
    if (filterStatus !== "all") result = result.filter((a) => a.status === filterStatus);
    if (filterJob !== "all") result = result.filter((a) => a.job_title === filterJob);
    setFiltered(result);
  }, [filterStatus, filterJob, applicants]);

  const jobTitles = [...new Set(applicants.map((a) => a.job_title))].sort();

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
      }
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">C</span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
        </a>
        <nav className="space-y-1">
          <NavLink href="/employer/dashboard" label="Dashboard" />
          <NavLink href="/employer/post-job" label="Post a Job" />
          <NavLink href="/employer/applicants" label="Applicants" active />
          <NavLink href="/employer/messages" label="Messages" />
          <NavLink href="/employer/settings" label="Settings" />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-neutral-900">All Applicants</h1>
            <a href="/employer/dashboard" className="text-sm text-neutral-500 hover:text-neutral-700">
              ← Dashboard
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-5 flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none"
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none"
            >
              <option value="all">All roles</option>
              {jobTitles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span className="flex items-center text-sm text-neutral-500">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-center text-sm text-neutral-500">Loading…</p>
            ) : error ? (
              <p className="p-8 text-center text-sm text-red-600">{error}</p>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-sm font-medium text-neutral-700">No applicants found</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {applicants.length === 0
                    ? "Post a job to start receiving applications."
                    : "Try clearing your filters."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {filtered.map((a) => (
                  <li key={a.id}>
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/10 text-xs font-bold text-[#188a66]">
                        {a.applicant_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-neutral-900">{a.applicant_name}</p>
                            <p className="text-sm text-neutral-600">{a.job_title}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASSES[a.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                              {STATUS_LABELS[a.status] ?? a.status}
                            </span>
                            <p className="text-xs text-neutral-400">
                              {new Date(a.applied_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {a.resume_url && (
                            <a
                              href={a.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              View Resume
                            </a>
                          )}
                          {a.cover_note && (
                            <button
                              type="button"
                              onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              {expandedId === a.id ? "Hide note" : "Cover note"}
                            </button>
                          )}
                          <select
                            value={a.status}
                            disabled={updatingId === a.id}
                            onChange={(e) => void updateStatus(a.id, e.target.value)}
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-700 focus:outline-none disabled:opacity-50"
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {expandedId === a.id && a.cover_note && (
                          <div className="mt-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm text-neutral-700">
                            {a.cover_note}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
