"use client";

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

export default function DashboardPage() {
  const completionPercent = 70;

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
          <NavItem label="Saved Jobs" />
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
                Alex Johnson
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
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
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-sm font-bold text-[#188a66]">
                AJ
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Jobs Applied", value: "12", icon: "briefcase" },
              { label: "Saved Jobs", value: "8", icon: "bookmark" },
              { label: "Profile Views", value: "34", icon: "eye" },
              { label: "Interview Requests", value: "2", icon: "chat" },
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
              <p className="text-sm text-neutral-500">Your 5 most recent applications</p>
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
                  {RECENT_APPLICATIONS.map((application) => (
                    <tr key={application.id}>
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
                      <p className="text-sm font-semibold text-neutral-900">{job.company}</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-900">
                        {job.title}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-[#1D9E75]">{job.salary}</p>
                      <p className="mt-1 text-sm text-neutral-600">{job.location}</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#188a66]">
                        {job.match}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
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

