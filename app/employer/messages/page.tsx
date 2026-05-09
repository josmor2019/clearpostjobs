"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ApplicationNotification = {
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
  applied: "New application",
  reviewing: "In review",
  interview: "Interview scheduled",
  rejected: "Rejected",
  offered: "Offer extended",
  hired: "Hired",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NavLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <a href={href} className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-[#1D9E75]/10 text-[#188a66]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"}`}>
      {label}
    </a>
  );
}

export default function EmployerMessagesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ApplicationNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!res.ok) throw new Error("Failed to load messages.");
        const body = (await res.json()) as { applicants?: ApplicationNotification[] };
        if (!cancelled) setNotifications(body.applicants ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load messages.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [router]);

  const newCount = notifications.filter((n) => n.status === "applied").length;

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
          <NavLink href="/employer/applicants" label="Applicants" />
          <NavLink href="/employer/messages" label="Messages" active />
          <NavLink href="/employer/settings" label="Settings" />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-neutral-900">Inbox</h1>
              {newCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {newCount} new
                </span>
              )}
            </div>
            <a href="/employer/dashboard" className="text-sm text-neutral-500 hover:text-neutral-700">
              ← Dashboard
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {loading ? (
              <p className="p-8 text-center text-sm text-neutral-500">Loading…</p>
            ) : error ? (
              <p className="p-8 text-center text-sm text-red-600">{error}</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-16 px-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-neutral-400">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-700">No messages yet</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Application notifications will appear here when candidates apply to your jobs.
                </p>
                <a
                  href="/employer/post-job"
                  className="mt-4 inline-flex rounded-xl bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white hover:bg-[#188a66]"
                >
                  Post a Job
                </a>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-neutral-50 ${n.status === "applied" ? "bg-[#1D9E75]/[0.02]" : ""}`}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/10 text-xs font-bold text-[#188a66]">
                      {n.applicant_name.slice(0, 2).toUpperCase()}
                      {n.status === "applied" && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#1D9E75] ring-2 ring-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-neutral-900">
                        <span className="font-semibold">{n.applicant_name}</span>
                        {" applied for "}
                        <span className="font-semibold">{n.job_title}</span>
                      </p>
                      {n.cover_note && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{n.cover_note}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-400">{timeAgo(n.applied_at)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs text-neutral-500">
                        {STATUS_LABELS[n.status] ?? n.status}
                      </span>
                      <div className="flex gap-2">
                        {n.resume_url && (
                          <a
                            href={n.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#1D9E75] hover:underline"
                          >
                            Resume
                          </a>
                        )}
                        <a
                          href="/employer/applicants"
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700"
                        >
                          Review
                        </a>
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
