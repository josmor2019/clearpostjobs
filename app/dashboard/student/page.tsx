"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type RecentApp = {
  id: string;
  status: string;
  applied_at: string;
  jobs: { title: string; company: string | null } | null;
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
  return "bg-neutral-100 text-neutral-700";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "??";
}

function NavLink({ label, href, active = false }: { label: string; href: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-[#1D9E75]/10 text-[#188a66]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      {label}
    </a>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [totalApps, setTotalApps] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [profileData, setProfileData] = useState<{ avatar_url: string | null; resume_url: string | null; location: string | null; skills: string[] | null } | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (cancelled) return;
      if (userError || !user) { router.replace("/sign-in"); return; }

      setUserId(user.id);
      setEmailVerified(!!user.email_confirmed_at);

      const [profileRes, appsRes, appCountRes, interviewCountRes] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, avatar_url, resume_url, location, skills").eq("id", user.id).maybeSingle(),
        supabase.from("applications").select("id, status, applied_at, jobs(title, company)").eq("user_id", user.id).order("applied_at", { ascending: false }).limit(5),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "interview"),
      ]);

      if (cancelled) return;

      const profile = profileRes.data;
      const first = profile?.first_name ?? "";
      const last = profile?.last_name ?? "";
      setDisplayName(`${first} ${last}`.trim() || (user.email ?? ""));
      setProfileData(profile ? { avatar_url: profile.avatar_url, resume_url: profile.resume_url, location: profile.location, skills: profile.skills } : null);
      setTotalApps(appCountRes.count ?? 0);
      setInterviews(interviewCountRes.count ?? 0);
      setRecentApps((appsRes.data ?? []) as unknown as RecentApp[]);
      setLoaded(true);
    }

    void load();
    return () => { cancelled = true; };
  }, [router]);

  const referralLink = userId ? `${typeof window !== "undefined" ? window.location.origin : "https://clearpostjobs.vercel.app"}/ref/${userId.slice(0, 8)}` : "";

  async function copyReferralLink() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const profileItems = profileData ? [
    { label: "Add profile photo", done: !!profileData.avatar_url },
    { label: "Add resume", done: !!profileData.resume_url },
    { label: "Add GPA", done: false },
    { label: "Add graduation date", done: false },
    { label: "Verify email", done: emailVerified },
    { label: "Add skills", done: !!(profileData.skills && (profileData.skills as string[]).length > 0) },
  ] : [
    { label: "Add profile photo", done: false },
    { label: "Add resume", done: false },
    { label: "Add GPA", done: false },
    { label: "Add graduation date", done: false },
    { label: "Verify email", done: false },
    { label: "Add skills", done: false },
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

        <nav className="space-y-1">
          <NavLink label="Dashboard" href="/dashboard/student" active />
          <NavLink label="My Applications" href="/dashboard/applications" />
          <NavLink label="Saved Internships" href="#" />
          <NavLink label="Messages" href="#" />
          <NavLink label="Campus Ambassador" href="#" />
          <NavLink label="Profile" href="/dashboard/settings" />
          <NavLink label="Resume" href="/dashboard/resume" />
          <NavLink label="Settings" href="/dashboard/settings" />
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
            <div>
              <p className="text-sm text-neutral-500">Welcome back</p>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
                {displayName || "…"}
              </h1>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-sm font-bold text-[#188a66]">
              {displayName ? initials(displayName) : "…"}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Internships Applied", value: loaded ? String(totalApps) : "…", icon: "briefcase" },
              { label: "Saved Internships", value: "—", icon: "bookmark" },
              { label: "Profile Views", value: "—", icon: "eye" },
              { label: "Interview Requests", value: loaded ? String(interviews) : "…", icon: "chat" },
            ].map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Application Status</h2>
              <p className="text-sm text-neutral-500">Your recent applications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Company</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Role</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Date Applied</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {!loaded ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-neutral-400">Loading…</td>
                    </tr>
                  ) : recentApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-neutral-500">
                        No applications yet.{" "}
                        <a href="/internships" className="font-semibold text-[#1D9E75] hover:underline">Browse internships →</a>
                      </td>
                    </tr>
                  ) : (
                    recentApps.map((app) => (
                      <tr key={app.id}>
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-neutral-900">{app.jobs?.company ?? "—"}</td>
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

          <section className="overflow-hidden rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75] p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Earn while you study</h2>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
              Refer students and earn $10 per verified signup
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label htmlFor="referral-link" className="sr-only">Referral link</label>
              <input
                id="referral-link"
                readOnly
                value={referralLink}
                className="min-h-11 w-full flex-1 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-white/30 placeholder:text-white/60 focus:ring-2"
              />
              <button
                type="button"
                onClick={() => void copyReferralLink()}
                disabled={!referralLink}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white px-5 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Referrals</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">0</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Earnings</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">$0</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
          </section>
        </main>
      </div>
    </div>
  );
}
