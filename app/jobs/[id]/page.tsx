import type { ReactNode } from "react";

type PageProps = {
  params: { id: string };
};

const JOB = {
  id: "1",
  company: "Stripe",
  companyInitials: "ST",
  title: "Software Engineer, Payments Platform",
  verified: true,
  jobType: "Full-time",
  location: "Remote",
  experience: "Senior",
  salary: "$195k – $265k",
  posted: "Apr 14, 2026",
};

function Icon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75]"
      aria-hidden
    >
      {children}
    </span>
  );
}

export default function JobDetailPage({ params }: PageProps) {
  const jobTitle = JOB.title;
  const _id = params.id;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-neutral-500">
              <li>
                <a href="/" className="hover:text-neutral-900">
                  Home
                </a>
              </li>
              <li className="text-neutral-300" aria-hidden>
                /
              </li>
              <li>
                <a href="/jobs" className="hover:text-neutral-900">
                  Jobs
                </a>
              </li>
              <li className="text-neutral-300" aria-hidden>
                /
              </li>
              <li className="font-medium text-neutral-900">{jobTitle}</li>
            </ol>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left column */}
          <section className="lg:col-span-8">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600"
                aria-label={`${JOB.company} logo`}
              >
                {JOB.companyInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-700">
                  {JOB.company}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                    {JOB.title}
                  </h1>
                  {JOB.verified ? (
                    <span className="inline-flex items-center rounded-full bg-[#1D9E75]/12 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#188a66]">
                      Verified
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {JOB.jobType}
                  </span>
                  <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {JOB.location}
                  </span>
                  <span className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {JOB.experience}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-2xl font-bold tracking-tight text-[#1D9E75] sm:text-3xl">
                    {JOB.salary}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Posted {JOB.posted}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-8">
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-xl font-semibold text-neutral-900">
                  About the role
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  You will build reliable systems that move money at scale. This
                  role focuses on product-quality engineering, performance,
                  observability, and thoughtful API design. You will work closely
                  with product, design, and infrastructure partners to ship
                  features that are secure, measurable, and easy to maintain.
                </p>

                <h2 className="mt-8 text-xl font-semibold text-neutral-900">
                  Requirements
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>5+ years building production web or backend systems.</li>
                  <li>
                    Strong fundamentals in data modeling, testing, and
                    reliability.
                  </li>
                  <li>Experience shipping APIs used by external developers.</li>
                  <li>Comfortable debugging across services and environments.</li>
                  <li>Clear written communication and ownership mindset.</li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold text-neutral-900">
                  Nice to have
                </h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                  <li>Payments, fintech, or fraud/risk domain experience.</li>
                  <li>Experience with distributed systems and queues.</li>
                  <li>Performance profiling and system observability depth.</li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold text-neutral-900">
                  About the company
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Clearpost features verified listings from companies that value
                  transparency. This is placeholder copy for the company profile
                  section—add your mission, culture, and benefits here when your
                  real company data is wired up.
                </p>
              </div>
            </div>
          </section>

          {/* Right column */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
                >
                  Apply now
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  Save job
                </button>

                <div className="mt-5 rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Salary
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#1D9E75]">
                    {JOB.salary}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Job highlights
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Icon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 10.5a2 2 0 100-4 2 2 0 000 4z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </Icon>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {JOB.location}
                        </p>
                        <p className="text-xs text-neutral-500">Location</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <Icon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M7 7V6a2 2 0 012-2h6a2 2 0 012 2v1"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5 8h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Icon>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {JOB.jobType}
                        </p>
                        <p className="text-xs text-neutral-500">Job type</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <Icon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M12 3v8l6 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </Icon>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {JOB.experience}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Experience level
                        </p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <Icon>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M7 3v3M17 3v3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 8h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 12h8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </Icon>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {JOB.posted}
                        </p>
                        <p className="text-xs text-neutral-500">Posted</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 border-t border-neutral-200 pt-5">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-neutral-500"
                      aria-hidden
                    >
                      <path
                        d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 000-7.07 5 5 0 00-7.07 0L10 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 11a5 5 0 01-7.07 0L5.5 9.6a5 5 0 010-7.07 5 5 0 017.07 0L14 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Share job link
                  </a>
                </div>
              </div>

              <p className="text-xs text-neutral-400">
                Job id: <span className="font-medium text-neutral-600">{_id}</span>
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

