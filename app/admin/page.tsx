"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

type Stats = {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  totalApplications: number;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  status: string;
  created_at: string;
  employer_id: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ghostRunning, setGhostRunning] = useState(false);
  const [ghostResult, setGhostResult] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "jobs" | "users">("overview");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error || !user) {
        router.replace("/sign-in");
        return;
      }
      const email = (user.email ?? "").toLowerCase();
      if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
        router.replace("/dashboard");
        return;
      }
      setAuthed(true);

      const [jobsRes] = await Promise.all([
        supabase.from("jobs").select("id, title, company, status, created_at, employer_id").order("created_at", { ascending: false }).limit(50),
      ]);

      const allJobs = (jobsRes.data ?? []) as JobRow[];
      setJobs(allJobs);

      const active = allJobs.filter((j) => ["active", "published", "open"].includes((j.status ?? "").toLowerCase())).length;
      const expired = allJobs.filter((j) => (j.status ?? "").toLowerCase() === "expired").length;

      setStats({
        totalUsers: 0,
        totalJobs: allJobs.length,
        activeJobs: active,
        expiredJobs: expired,
        totalApplications: 0,
      });

      setLoading(false);
    });
  }, [router]);

  async function runGhostJobRemoval() {
    setGhostRunning(true);
    setGhostResult(null);
    const res = await fetch("/api/cron/remove-ghost-jobs");
    const data = (await res.json()) as { removed?: number; error?: string };
    setGhostResult(data.error ? `Error: ${data.error}` : `Removed ${data.removed ?? 0} ghost jobs.`);
    setGhostRunning(false);

    const jobsRes = await supabase.from("jobs").select("id, title, company, status, created_at, employer_id").order("created_at", { ascending: false }).limit(50);
    const allJobs = (jobsRes.data ?? []) as JobRow[];
    setJobs(allJobs);
  }

  async function updateJobStatus(id: string, status: string) {
    await supabase.from("jobs").update({ status }).eq("id", id);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  }

  if (!authed || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">{!authed ? "Checking access…" : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold text-[#1D9E75]">Clearpost</a>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">Admin</span>
          </div>
          <div className="flex gap-2">
            <a href="/dashboard" className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">← Dashboard</a>
            <button onClick={() => void supabase.auth.signOut().then(() => router.replace("/"))} className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 w-fit">
          {(["overview", "jobs", "users"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${tab === t ? "bg-[#1D9E75] text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Jobs", value: stats?.totalJobs ?? 0 },
                { label: "Active Listings", value: stats?.activeJobs ?? 0 },
                { label: "Ghost Jobs Removed", value: stats?.expiredJobs ?? 0 },
                { label: "Total Applications", value: stats?.totalApplications ?? 0 },
              ].map((s) => (
                <article key={s.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-neutral-500">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold">{s.value}</p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">Ghost Job Removal</h2>
              <p className="mb-4 text-sm text-neutral-600">
                Marks listings older than 48 hours without confirmed status as Expired. Runs automatically via cron on Vercel.
              </p>
              <button
                onClick={() => void runGhostJobRemoval()}
                disabled={ghostRunning}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {ghostRunning ? "Running…" : "Run Ghost Job Removal Now"}
              </button>
              {ghostResult ? (
                <p className={`mt-3 text-sm font-medium ${ghostResult.startsWith("Error") ? "text-red-600" : "text-emerald-600"}`}>
                  {ghostResult}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "jobs" ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">All Job Listings</h2>
              <span className="text-sm text-neutral-500">{jobs.length} listings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    {["Title", "Company", "Status", "Posted", "Actions"].map((h) => (
                      <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-3 py-3 font-medium text-neutral-900">{job.title}</td>
                      <td className="px-3 py-3 text-neutral-600">{job.company}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ["active","published","open"].includes((job.status ?? "").toLowerCase())
                            ? "bg-emerald-100 text-emerald-700"
                            : job.status?.toLowerCase() === "expired"
                            ? "bg-neutral-100 text-neutral-600"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {job.status ?? "Unknown"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-neutral-500 text-xs">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex gap-1">
                          {job.status?.toLowerCase() !== "expired" ? (
                            <button onClick={() => void updateJobStatus(job.id, "Expired")} className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                              Expire
                            </button>
                          ) : (
                            <button onClick={() => void updateJobStatus(job.id, "Active")} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {tab === "users" ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">User Management</h2>
            <p className="text-sm text-neutral-500">
              User list requires the Supabase service role key to query <code>auth.users</code>. Set{" "}
              <code className="rounded bg-neutral-100 px-1 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> and build a dedicated admin API route.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
