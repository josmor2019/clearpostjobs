"use client";

import { useState } from "react";

const INTERNSHIP_APPLICATIONS = [
  {
    id: "1",
    company: "Stripe",
    role: "Software Engineering Intern",
    dateApplied: "Apr 14, 2026",
    status: "Interview",
  },
  {
    id: "2",
    company: "Google",
    role: "PM Intern",
    dateApplied: "Apr 11, 2026",
    status: "In Review",
  },
  {
    id: "3",
    company: "Airbnb",
    role: "Design Intern",
    dateApplied: "Apr 9, 2026",
    status: "Applied",
  },
  {
    id: "4",
    company: "Meta",
    role: "Data Science Intern",
    dateApplied: "Apr 6, 2026",
    status: "Rejected",
  },
] as const;

const RECOMMENDED_INTERNSHIPS = [
  {
    id: "1",
    company: "Notion",
    title: "Product Design Intern",
    stipend: "$7.5k/mo",
    duration: "12 weeks",
    location: "Remote (US)",
    match: "93% match",
  },
  {
    id: "2",
    company: "Vercel",
    title: "Developer Experience Intern",
    stipend: "$8k/mo",
    duration: "10 weeks",
    location: "Remote",
    match: "89% match",
  },
  {
    id: "3",
    company: "Linear",
    title: "Engineering Intern, Frontend",
    stipend: "$9k/mo",
    duration: "12 weeks",
    location: "San Francisco, CA",
    match: "86% match",
  },
] as const;

const PROFILE_ITEMS = [
  { label: "Add profile photo", done: false },
  { label: "Add resume", done: false },
  { label: "Add GPA", done: false },
  { label: "Add graduation date", done: false },
  { label: "Verify .edu email", done: true },
  { label: "Add skills", done: false },
] as const;

const REFERRAL_LINK = "https://clearpost.com/ref/jordan-lee-4821";

function statusClasses(status: string) {
  if (status === "Applied") return "bg-neutral-100 text-neutral-700";
  if (status === "In Review") return "bg-blue-100 text-blue-700";
  if (status === "Interview") return "bg-[#1D9E75]/15 text-[#188a66]";
  return "bg-red-100 text-red-700";
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <a
      href="#"
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

export default function StudentDashboardPage() {
  const completionPercent = 60;
  const [copied, setCopied] = useState(false);

  async function copyReferralLink() {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
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
          <NavItem label="Dashboard" active />
          <NavItem label="My Applications" />
          <NavItem label="Saved Internships" />
          <NavItem label="Messages" />
          <NavItem label="Campus Ambassador" />
          <NavItem label="Profile" />
          <NavItem label="Resume" />
          <NavItem label="Settings" />
          <NavItem label="Sign out" />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm text-neutral-500">Welcome back</p>
              <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
                Jordan Lee
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Notifications, 2 unread"
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
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  2
                </span>
              </button>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-sm font-bold text-[#188a66]">
                JL
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Internships Applied", value: "5", icon: "briefcase" },
              { label: "Saved Internships", value: "12", icon: "bookmark" },
              { label: "Profile Views", value: "21", icon: "eye" },
              { label: "Interview Requests", value: "1", icon: "chat" },
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

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Application Status</h2>
              <p className="text-sm text-neutral-500">Your recent internship applications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left">
                <thead className="bg-neutral-50">
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
                  {INTERNSHIP_APPLICATIONS.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-neutral-900">
                        {row.company}
                      </td>
                      <td className="px-3 py-3 text-sm text-neutral-600">{row.role}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-600">
                        {row.dateApplied}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
                            row.status,
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recommended Internships</h2>
              <p className="text-sm text-neutral-500">Picked for your profile and interests</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RECOMMENDED_INTERNSHIPS.map((job) => (
                <li key={job.id}>
                  <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm">
                    <p className="text-sm font-semibold text-neutral-900">{job.company}</p>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">
                      {job.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[#1D9E75]">{job.stipend}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600">
                        {job.duration}
                      </span>
                      <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-600">
                        {job.location}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#188a66]">
                      {job.match}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75] p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Earn while you study</h2>
            <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
              Refer students and earn $10 per verified signup
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label htmlFor="referral-link" className="sr-only">
                Referral link
              </label>
              <input
                id="referral-link"
                readOnly
                value={REFERRAL_LINK}
                className="min-h-11 w-full flex-1 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-white/30 placeholder:text-white/60 focus:ring-2"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white px-5 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-white/90"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Referrals
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">8</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Earnings
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">$80</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
          </section>
        </main>
      </div>
    </div>
  );
}
