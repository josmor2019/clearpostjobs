"use client";

const ACTIVE_JOBS = [
  {
    id: "1",
    title: "Software Engineer",
    location: "Remote",
    type: "Full-time",
    applicants: 12,
    posted: "Apr 2, 2026",
    status: "Active",
  },
  {
    id: "2",
    title: "Product Manager",
    location: "San Francisco",
    type: "Full-time",
    applicants: 8,
    posted: "Mar 28, 2026",
    status: "Active",
  },
  {
    id: "3",
    title: "Data Scientist",
    location: "New York",
    type: "Full-time",
    applicants: 15,
    posted: "Mar 22, 2026",
    status: "Paused",
  },
  {
    id: "4",
    title: "UX Designer",
    location: "Remote",
    type: "Full-time",
    applicants: 7,
    posted: "Mar 18, 2026",
    status: "Active",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    location: "Austin",
    type: "Full-time",
    applicants: 6,
    posted: "Mar 10, 2026",
    status: "Active",
  },
] as const;

const RECENT_APPLICANTS = [
  {
    id: "1",
    initials: "SK",
    name: "Sam Kim",
    role: "Software Engineer",
    match: "94% match",
    applied: "Apr 14, 2026",
    status: "New",
  },
  {
    id: "2",
    initials: "MR",
    name: "Morgan Rivera",
    role: "Product Manager",
    match: "88% match",
    applied: "Apr 13, 2026",
    status: "In Review",
  },
  {
    id: "3",
    initials: "JC",
    name: "Jordan Chen",
    role: "Data Scientist",
    match: "91% match",
    applied: "Apr 12, 2026",
    status: "Interview",
  },
  {
    id: "4",
    initials: "AP",
    name: "Alex Patel",
    role: "UX Designer",
    match: "85% match",
    applied: "Apr 11, 2026",
    status: "New",
  },
] as const;

function jobStatusClasses(status: string) {
  if (status === "Active") return "bg-[#1D9E75]/15 text-[#188a66]";
  return "bg-amber-100 text-amber-800";
}

function applicantStatusClasses(status: string) {
  if (status === "New") return "bg-neutral-100 text-neutral-700";
  if (status === "In Review") return "bg-blue-100 text-blue-700";
  return "bg-[#1D9E75]/15 text-[#188a66]";
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

export default function EmployerDashboardPage() {
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
          <NavItem label="My Jobs" />
          <NavItem label="Applicants" />
          <NavItem label="Messages" />
          <NavItem label="Post a Job" />
          <NavItem label="Company Profile" />
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
                Horizon Labs
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                aria-label="Notifications, 3 unread"
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
                  3
                </span>
              </button>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1D9E75]/15 text-xs font-bold text-[#188a66]">
                HL
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section aria-label="Stats row" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Active Job Listings", value: "6", icon: "list" },
              { label: "Total Applicants", value: "48", icon: "people" },
              { label: "Interviews Scheduled", value: "4", icon: "calendar" },
              { label: "Positions Filled", value: "2", icon: "check" },
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
                    {stat.icon === "list" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "people" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "calendar" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M7 3v3M17 3v3M4 8h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 12h8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : null}
                    {stat.icon === "check" ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                      >
                        <path
                          d="M5 12l4 4L19 7"
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
              <h2 className="text-lg font-semibold text-neutral-900">Active Job Listings</h2>
              <p className="text-sm text-neutral-500">Manage postings and applicant volume</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Job Title
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Location
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Type
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Applicants
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Posted Date
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {ACTIVE_JOBS.map((job) => (
                    <tr key={job.id}>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-neutral-900">
                        {job.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-neutral-600">
                        {job.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-neutral-600">
                        {job.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-neutral-600">
                        {job.applicants}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-neutral-600">
                        {job.posted}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${jobStatusClasses(
                            job.status,
                          )}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            Pause
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Applicants</h2>
              <p className="text-sm text-neutral-500">Latest candidates across your roles</p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {RECENT_APPLICANTS.map((a) => (
                <li key={a.id}>
                  <article className="flex flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">
                        {a.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-neutral-900">{a.name}</p>
                        <p className="text-sm text-neutral-600">{a.role}</p>
                        <p className="mt-1 text-xs font-bold text-[#188a66]">{a.match}</p>
                        <p className="mt-1 text-xs text-neutral-500">Applied {a.applied}</p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${applicantStatusClasses(
                            a.status,
                          )}`}
                        >
                          {a.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#1D9E75] px-3 py-2 text-xs font-semibold text-white hover:bg-[#188a66]"
                      >
                        Schedule Interview
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Quick actions">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                type="button"
                className="flex items-center gap-4 rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75] p-5 text-left text-white shadow-sm transition-colors hover:bg-[#188a66]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Post a New Job</p>
                  <p className="mt-0.5 text-sm text-white/85">Create a verified listing</p>
                </div>
              </button>
              <button
                type="button"
                className="flex items-center gap-4 rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75] p-5 text-left text-white shadow-sm transition-colors hover:bg-[#188a66]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                  >
                    <path
                      d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">View All Applicants</p>
                  <p className="mt-0.5 text-sm text-white/85">Review pipeline in one place</p>
                </div>
              </button>
              <button
                type="button"
                className="flex items-center gap-4 rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75] p-5 text-left text-white shadow-sm transition-colors hover:bg-[#188a66]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 3l2.09 6.26L20 9.27l-5 3.64 1.91 6.09L12 15.77 7.09 19l1.91-6.09-5-3.64 5.91-.01L12 3z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">Upgrade to Featured</p>
                  <p className="mt-0.5 text-sm text-white/85">Boost visibility to top talent</p>
                </div>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Job Performance</h2>
              <p className="text-sm text-neutral-500">
                Snapshot for your top-performing role:{" "}
                <span className="font-medium text-neutral-700">Software Engineer</span>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Most viewed listing
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">2,840</p>
                <p className="mt-1 text-xs text-neutral-500">views in the last 30 days</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Most applied listing
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-[#1D9E75]">12</p>
                <p className="mt-1 text-xs text-neutral-500">applications this posting cycle</p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Average time to fill
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-neutral-900">24</p>
                <p className="mt-1 text-xs text-neutral-500">days from publish to accepted offer</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
