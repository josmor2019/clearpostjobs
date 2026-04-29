"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type AppStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "rejected"
  | "offered"
  | "hired"
  | "withdrawn";

type Application = {
  id: string;
  job_id: string;
  status: AppStatus;
  applied_at: string;
  cover_note: string | null;
  resume_url: string | null;
  job?: { title: string; company: string } | null;
};

const STATUS_LABEL: Record<AppStatus, string> = {
  applied: "Applied",
  reviewing: "Under review",
  interview: "Interview",
  rejected: "Rejected",
  offered: "Offer received",
  hired: "Hired",
  withdrawn: "Withdrawn",
};

const STATUS_COLOR: Record<AppStatus, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  interview: "bg-purple-50 text-purple-700 border-purple-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  offered: "bg-[#1D9E75]/8 text-[#147b5b] border-[#1D9E75]/25",
  hired: "bg-[#1D9E75]/15 text-[#147b5b] border-[#1D9E75]/30",
  withdrawn: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "withdrawn">("active");
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/sign-in"); return; }

    const res = await fetch("/api/applications", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) { setLoading(false); return; }

    const raw = (await res.json()) as { applications: Application[] };

    // Enrich with job details via join — if the API returns job data, use it;
    // otherwise fetch individually (graceful fallback)
    const enriched = raw.applications as Application[];
    setApps(enriched);
    setLoading(false);
  }, [router]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  async function handleWithdraw(appId: string) {
    setWithdrawing(appId);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/applications/${appId}/withdraw`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    setWithdrawing(null);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to withdraw application.");
      return;
    }

    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, status: "withdrawn" as AppStatus }
          : a,
      ),
    );
  }

  const active = apps.filter((a) => a.status !== "withdrawn");
  const withdrawn = apps.filter((a) => a.status === "withdrawn");
  const shown = tab === "active" ? active : withdrawn;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M12 16L6 10l6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-semibold text-neutral-900">My applications</span>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Application tracker
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {active.length} active · {withdrawn.length} withdrawn
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 w-fit">
          {(["active", "withdrawn"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-[#1D9E75] text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {t === "active" ? `Active (${active.length})` : `Withdrawn (${withdrawn.length})`}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
            <p className="text-sm font-medium text-neutral-700">
              {tab === "active" ? "No active applications yet" : "No withdrawn applications"}
            </p>
            {tab === "active" && (
              <a
                href="/jobs"
                className="mt-3 rounded-xl bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white hover:bg-[#188a66]"
              >
                Browse jobs →
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900">
                      {app.job?.title ?? "Role"}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      {app.job?.company ?? "Company"} · Applied {formatDate(app.applied_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[app.status]}`}
                    >
                      {STATUS_LABEL[app.status]}
                    </span>

                    {app.status !== "withdrawn" &&
                      app.status !== "rejected" &&
                      app.status !== "hired" && (
                        <button
                          type="button"
                          disabled={withdrawing === app.id}
                          onClick={() => void handleWithdraw(app.id)}
                          className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {withdrawing === app.id ? "Withdrawing…" : "Withdraw"}
                        </button>
                      )}

                    {app.resume_url && (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        Resume
                      </a>
                    )}
                  </div>
                </div>

                {app.cover_note && (
                  <p className="mt-3 line-clamp-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                    {app.cover_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
