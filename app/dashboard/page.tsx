"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SkeletonStatCard, SkeletonTableRow } from "@/components/Skeleton";

type RecentApp = {
  id: string;
  status: string;
  applied_at: string;
  jobs: { title: string; company: string | null } | null;
};

type RecommendedJob = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
};

type ProfileData = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  location: string | null;
  skills: string[] | null;
};

const STATUS_DISPLAY: Record<string, string> = {
  applied: "Applied",
  reviewing: "In Review",
  interview: "Interview",
  rejected: "Rejected",
  offered: "Offered",
  hired: "Hired",
};

function statusClasses(status: string) {
  if (status === "applied") return "bg-neutral-100 text-neutral-700";
  if (status === "reviewing") return "bg-blue-100 text-blue-700";
  if (status === "interview") return "bg-[#1D9E75]/15 text-[#188a66]";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "offered") return "bg-purple-100 text-purple-700";
  if (status === "hired") return "bg-emerald-100 text-emerald-700";
  return "bg-neutral-100 text-neutral-700";
}

function headerAvatarInitials(label: string) {
  const t = label.trim();
  if (!t) return "…";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (t.length >= 2) return t.slice(0, 2).toUpperCase();
  return `${t[0]!}${t[0]!}`.toUpperCase();
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return null;
}

const NAV_LINKS = [
  {
    label: "Dashboard", href: "/dashboard",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="12" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="12" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="12" y="12" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>,
  },
  {
    label: "My Applications", href: "/dashboard/applications",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><path d="M4 4h12v12H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 9h4M8 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Saved Jobs", href: "#",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><path d="M5 3h10v14l-5-2.5L5 17V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    label: "Resume co-pilot", href: "/dashboard/resume",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><path d="M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" /><path d="M7 7h6M7 10h6M7 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Cover letter", href: "/dashboard/cover-letter",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8l7 4.5L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Salary coach", href: "/dashboard/salary-coach",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M10 7v1.5a1.5 1.5 0 000 3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8 7.5h2.5M8.5 13.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    label: "Settings", href: "/dashboard/settings",
    icon: <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.05 5.05l1.06 1.06M13.89 13.89l1.06 1.06M5.05 14.95l1.06-1.06M13.89 6.11l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
] as const;

function NavItem({ label, href, icon, active = false }: { label: string; href: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-[#1D9E75]/10 text-[#188a66]" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      }`}
    >
      <span className={active ? "text-[#1D9E75]" : "text-neutral-400"}>{icon}</span>
      {label}
    </a>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [authLoaded, setAuthLoaded] = useState(false);
  const [momentum, setMomentum] = useState<{ thisWeek: number; lastWeek: number } | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [stats, setStats] = useState({ totalApplications: 0, interviews: 0 });
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setShowPaymentSuccess(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("payment");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;
      if (userError || !user) { router.replace("/sign-in"); return; }

      setEmailVerified(!!user.email_confirmed_at);

      const [profileRes, appsRes, appCountRes, interviewCountRes, jobsRes] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, avatar_url, resume_url, location, skills").eq("id", user.id).maybeSingle(),
        supabase.from("applications").select("id, status, applied_at, jobs(title, company)").eq("user_id", user.id).order("applied_at", { ascending: false }).limit(5),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "interview"),
        supabase.from("jobs").select("id, title, company, location, salary_min, salary_max").eq("status", "active").limit(3),
      ]);

      if (cancelled) return;

      const profile = profileRes.data;
      const first = profile?.first_name ?? "";
      const last = profile?.last_name ?? "";
      setDisplayName(`${first} ${last}`.trim() || user.email ?? "");
      setProfileData(profile);
      setAuthLoaded(true);
      setRecentApps((appsRes.data ?? []) as unknown as RecentApp[]);
      setStats({ totalApplications: appCountRes.count ?? 0, interviews: interviewCountRes.count ?? 0 });
      setRecommendedJobs((jobsRes.data ?? []) as unknown as RecommendedJob[]);

      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        fetch("/api/applications/momentum", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data: { thisWeek: number; lastWeek: number } | null) => {
            if (!cancelled && data) setMomentum(data);
          })
          .catch(() => {});
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [router]);

  const profileItems = profileData ? [
    { label: "Add profile photo", done: !!profileData.avatar_url },
    { label: "Add resume", done: !!profileData.resume_url },
    { label: "Add skills", done: !!(profileData.skills && (profileData.skills as string[]).length > 0) },
    { label: "Add work experience", done: false },
    { label: "Verify email", done: emailVerified },
    { label: "Add location", done: !!profileData.location },
  ] : [
    { label: "Add profile photo", done: false },
    { label: "Add resume", done: false },
    { label: "Add skills", done: false },
    { label: "Add work experience", done: false },
    { label: "Verify email", done: false },
    { label: "Add location", done: false },
  ];

  const completionPercent = profileData
    ? Math.round((profileItems.filter((i) => i.done).length / profileItems.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">C</span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
        </a>

        <nav className="space-y-0.5">
          {NAV_LINKS.map(({ label, href, icon }) => (
            <NavItem key={label} label={label} href={href} icon={icon} active={label === "Dashboard"} />
          ))}
          <button
            type="button"
            onClick={() => void supabase.auth.signOut().then(() => router.replace("/sign-in"))}
            className="inline-flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            Sign out
          </button>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Welcome back, {displayName || "…"}
            </h1>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-sm font-bold text-[#188a66]">
              {headerAvatarInitials(displayName)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {showPaymentSuccess && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/8 px-4 py-3">
              <p className="text-sm font-medium text-[#147b5b]">
                You&apos;re now on Pro — all features are unlocked.
              </p>
              <button
                type="button"
                onClick={() => setShowPaymentSuccess(false)}
                className="shrink-0 text-[#1D9E75] hover:text-[#147b5b]"
                aria-label="Dismiss"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!authLoaded ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : [
              { label: "Jobs Applied", value: String(stats.totalApplications), icon: "briefcase" },
              { label: "Saved Jobs", value: "—", icon: "bookmark" },
              { label: "Profile Views", value: "—", icon: "eye" },
              { label: "Interview Requests", value: String(stats.interviews), icon: "chat" },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{stat.value}</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/12 text-[#1D9E75]">
                    {stat.icon === "briefcase" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {stat.icon === "bookmark" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M6 4h12v16l-6-3-6 3V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {stat.icon === "eye" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                    )}
                    {stat.icon === "chat" && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M4 5h16v11H8l-4 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </div>
              </article>
            ))}
          </section>

          {momentum !== null && (() => {
            const max = Math.max(momentum.thisWeek, momentum.lastWeek, 1);
            const diff = momentum.thisWeek - momentum.lastWeek;
            const pct = momentum.lastWeek === 0
              ? momentum.thisWeek > 0 ? 100 : 0
              : Math.round((diff / momentum.lastWeek) * 100);
            const isUp = diff >= 0;
            return (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm" aria-label="Application momentum">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">Application Momentum</h2>
                    <p className="text-sm text-neutral-500">This week vs last week</p>
                  </div>
                  {diff !== 0 && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${isUp ? "bg-[#1D9E75]/10 text-[#147b5b]" : "bg-red-50 text-red-600"}`}>
                      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-end gap-6">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">This week</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-900">{momentum.thisWeek}</p>
                    <div className="mt-2 h-2 rounded-full bg-[#1D9E75]" style={{ width: `${(momentum.thisWeek / max) * 100}%` }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Last week</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-neutral-400">{momentum.lastWeek}</p>
                    <div className="mt-2 h-2 rounded-full bg-neutral-200" style={{ width: `${(momentum.lastWeek / max) * 100}%` }} />
                  </div>
                </div>
              </section>
            );
          })()}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Recent applications</h2>
                <p className="text-sm text-neutral-500">Your 5 most recent applications</p>
              </div>
              <a href="/dashboard/applications" className="text-sm font-semibold text-[#1D9E75] hover:text-[#147b5b]">
                View all →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-100 text-left">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Company</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Role</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Date Applied</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {!authLoaded ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} />)
                  ) : recentApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-neutral-500">
                        No applications yet.{" "}
                        <a href="/jobs" className="font-semibold text-[#1D9E75] hover:underline">Browse jobs →</a>
                      </td>
                    </tr>
                  ) : (
                    recentApps.map((app) => (
                      <tr key={app.id} className="transition-colors hover:bg-neutral-50/50">
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-neutral-900">
                          {app.jobs?.company ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-sm text-neutral-600">{app.jobs?.title ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-600">
                          {new Date(app.applied_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(app.status)}`}>
                            {STATUS_DISPLAY[app.status] ?? app.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Browse Jobs</h2>
                <p className="text-sm text-neutral-500">Active openings on Clearpost</p>
              </div>
              {!authLoaded ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-xl bg-neutral-100" />
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 py-10 text-center">
                  <p className="text-sm text-neutral-500">No active jobs yet.</p>
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendedJobs.map((job) => {
                    const salary = formatSalary(job.salary_min, job.salary_max);
                    return (
                      <li key={job.id}>
                        <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm">
                          <p className="text-sm font-semibold text-neutral-900">{job.company ?? "Company"}</p>
                          <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">{job.title}</h3>
                          {salary && <p className="mt-2 text-sm font-semibold text-[#1D9E75]">{salary}</p>}
                          {job.location && <p className="mt-1 text-sm text-neutral-600">{job.location}</p>}
                          <div className="mt-3 flex gap-2">
                            <a href={`/apply/${job.id}`} className="inline-flex rounded-lg bg-[#1D9E75] px-3 py-1 text-xs font-semibold text-white hover:bg-[#188a66]">Apply</a>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 text-center">
                <a href="/jobs" className="text-sm font-semibold text-[#1D9E75] hover:text-[#188a66]">Browse all verified jobs →</a>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Profile Completion</h2>
              <p className="mt-1 text-sm text-neutral-500">{completionPercent}% complete</p>
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-200">
                <div className="h-2 rounded-full bg-[#1D9E75]" style={{ width: `${completionPercent}%` }} />
              </div>

              <ul className="mt-5 space-y-2">
                {profileItems.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                        item.done ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#188a66]" : "border-neutral-300 text-neutral-400"
                      }`}
                      aria-hidden
                    >
                      {item.done && (
                        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                          <path d="M5 10.5L8.2 13.5L15 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className={item.done ? "text-neutral-600" : "text-neutral-700"}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
