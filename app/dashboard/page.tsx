"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { SkeletonBox, SkeletonStatCard, SkeletonTableRow } from "@/components/Skeleton";

type NotificationItem = {
  id: string;
  type: "green" | "red" | "yellow" | "blue";
  message: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "green",
    message: "Stripe wants to schedule an interview",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    type: "red",
    message: "Your application to Meta was not selected",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "yellow",
    message: "You have an interview with Figma in 15 minutes",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "4",
    type: "blue",
    message: "3 new jobs match your profile",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "blue",
    message: "Notion viewed your profile",
    time: "Yesterday",
    read: true,
  },
];

function dotClass(type: NotificationItem["type"]) {
  if (type === "green") return "bg-emerald-500";
  if (type === "red") return "bg-red-500";
  if (type === "yellow") return "bg-amber-400";
  return "bg-blue-500";
}

const RECENT_APPLICATIONS = [
  {
    id: "1",
    company: "Stripe",
    role: "Software Engineer, Payments Platform",
    dateApplied: "Apr 12, 2026",
    status: "In Review",
  },
  {
    id: "2",
    company: "Notion",
    role: "Product Engineer, Growth",
    dateApplied: "Apr 10, 2026",
    status: "Applied",
  },
  {
    id: "3",
    company: "Figma",
    role: "Frontend Engineer, Design Systems",
    dateApplied: "Apr 8, 2026",
    status: "Interview",
  },
  {
    id: "4",
    company: "Meta",
    role: "Data Scientist",
    dateApplied: "Apr 6, 2026",
    status: "Rejected",
  },
  {
    id: "5",
    company: "Vercel",
    role: "Developer Experience Engineer",
    dateApplied: "Apr 5, 2026",
    status: "In Review",
  },
] as const;

const RECOMMENDED_JOBS = [
  {
    id: "1",
    company: "Linear",
    title: "Staff Frontend Engineer",
    salary: "$220k - $290k",
    location: "San Francisco, CA",
    match: "94% match",
  },
  {
    id: "2",
    company: "Anthropic",
    title: "Machine Learning Engineer, Inference",
    salary: "$240k - $320k",
    location: "Remote (US)",
    match: "91% match",
  },
  {
    id: "3",
    company: "Airbnb",
    title: "Senior Software Engineer, Marketplace",
    salary: "$180k - $250k",
    location: "Remote",
    match: "88% match",
  },
] as const;

const PROFILE_ITEMS = [
  { label: "Add profile photo", done: false },
  { label: "Add resume", done: false },
  { label: "Add skills", done: false },
  { label: "Add work experience", done: false },
  { label: "Verify email", done: true },
  { label: "Add location", done: true },
] as const;

function statusClasses(status: string) {
  if (status === "Applied") {
    return "bg-neutral-100 text-neutral-700";
  }
  if (status === "In Review") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "Interview") {
    return "bg-[#1D9E75]/15 text-[#188a66]";
  }
  return "bg-red-100 text-red-700";
}

function headerAvatarInitials(label: string) {
  const t = label.trim();
  if (!t) return "…";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  if (t.length >= 2) return t.slice(0, 2).toUpperCase();
  return `${t[0]!}${t[0]!}`.toUpperCase();
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
        active
          ? "bg-[#1D9E75]/10 text-[#188a66]"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (userError || !user) {
        router.replace("/sign-in");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const first = profile?.first_name ?? "";
      const last = profile?.last_name ?? "";
      const fullName = `${first} ${last}`.trim();
      const email = user.email ?? "";
      setDisplayName(fullName || email);
      setAuthLoaded(true);

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
    return () => {
      cancelled = true;
    };
  }, [router]);

  const completionPercent = 70;
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
                Welcome back, {displayName || "…"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
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
                  {unreadCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {notificationsOpen ? (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                      <h2 className="text-sm font-semibold text-neutral-900">
                        Notifications
                      </h2>
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-[#1D9E75] hover:text-[#188a66]"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <ul className="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <div
                            className={`flex gap-3 px-4 py-3 ${
                              n.read ? "bg-white" : "bg-[#1D9E75]/8"
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass(
                                n.type,
                              )}`}
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-900">
                                {n.message}
                              </p>
                              <p className="mt-0.5 text-xs text-neutral-500">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-neutral-100 px-4 py-3">
                      <a
                        href="#"
                        className="text-sm font-semibold text-[#1D9E75] hover:text-[#188a66]"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-sm font-bold text-[#188a66]">
                {headerAvatarInitials(displayName)}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!authLoaded ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : [
              { label: "Jobs Applied", value: "12", icon: "briefcase" },
              { label: "Saved Jobs", value: "8", icon: "bookmark" },
              { label: "Profile Views", value: "34", icon: "eye" },
              { label: "Interview Requests", value: "2", icon: "chat" },
            ].map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
                      {stat.value}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/12 text-[#1D9E75]">
                    {stat.icon === "briefcase" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8 7V6a2 2 0 012-2h4a2 2 0 012 2v1M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "bookmark" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M6 4h12v16l-6-3-6 3V4z"
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
                    {stat.icon === "chat" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M4 5h16v11H8l-4 4V5z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
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
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Company
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Role
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Date Applied
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {!authLoaded
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} />)
                    : RECENT_APPLICATIONS.map((application) => (
                    <tr key={application.id} className="transition-colors hover:bg-neutral-50/50" >
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-neutral-900">
                        {application.company}
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600">{application.role}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-600">
                        {application.dateApplied}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                            application.status,
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>


          <section className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Recommended Jobs</h2>
                <p className="text-sm text-neutral-500">Based on your profile and activity</p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {RECOMMENDED_JOBS.map((job) => (
                  <li key={job.id}>
                    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-900">{job.company}</p>
                        <span className="shrink-0 inline-flex items-center rounded-full bg-[#1D9E75]/12 px-2 py-0.5 text-xs font-bold text-[#188a66]">
                          {job.match}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">
                        {job.title}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#1D9E75]">{job.salary}</p>
                      <p className="mt-1 text-sm text-neutral-600">{job.location}</p>
                      <div className="mt-3 flex gap-2">
                        <a href="/jobs" className="inline-flex rounded-lg bg-[#1D9E75] px-3 py-1 text-xs font-semibold text-white hover:bg-[#188a66]">Apply</a>
                        <button type="button" className="inline-flex rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Save</button>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <a href="/jobs" className="text-sm font-semibold text-[#1D9E75] hover:text-[#188a66]">Browse all verified jobs →</a>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900">Profile Completion</h2>
              <p className="mt-1 text-sm text-neutral-500">{completionPercent}% complete</p>
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-200">
                <div
                  className="h-2 rounded-full bg-[#1D9E75]"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <ul className="mt-5 space-y-2">
                {PROFILE_ITEMS.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                        item.done
                          ? "border-[#1D9E75] bg-[#1D9E75]/10 text-[#188a66]"
                          : "border-neutral-300 text-neutral-400"
                      }`}
                      aria-hidden
                    >
                      {item.done ? (
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            d="M5 10.5L8.2 13.5L15 6.8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <span className={item.done ? "text-neutral-600" : "text-neutral-700"}>
                      {item.label}
                    </span>
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

