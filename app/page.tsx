export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <nav
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
          aria-label="Primary"
        >
          <div className="flex h-16 items-center justify-between gap-3">
            <a href="/" className="flex min-w-0 shrink-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1D9E75] text-white shadow-sm">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M7 12L10.5 15.5L17 9"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="truncate text-lg font-semibold tracking-tight text-[#1D9E75]">
                Clearpost
              </span>
            </a>

            <div className="hidden items-center gap-6 lg:gap-8 md:flex">
              <a
                href="#jobs"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Browse Jobs
              </a>
              <a
                href="#internships"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Internships
              </a>
              <a
                href="#companies"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Companies
              </a>
              <a
                href="#salary"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Salary Guide
              </a>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <a
                href="#signin"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 sm:inline-flex"
              >
                Sign in
              </a>
              <a
                href="#get-started"
                className="inline-flex items-center justify-center rounded-lg bg-[#1D9E75] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] sm:px-4"
              >
                Get started
              </a>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-neutral-100 pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
            <a
              href="#jobs"
              className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              Browse Jobs
            </a>
            <a
              href="#internships"
              className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              Internships
            </a>
            <a
              href="#companies"
              className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              Companies
            </a>
            <a
              href="#salary"
              className="shrink-0 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              Salary Guide
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-neutral-100 bg-gradient-to-b from-neutral-50/80 to-white px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#188a66]">
              Verified jobs · Transparent pay
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
              The job board that only posts real jobs
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-neutral-600 sm:text-xl">
              Every listing is verified by our team. Salary ranges are shown upfront
              so you can compare fairly—professionals and interns both see the full
              picture before you apply.
            </p>

            <form
              className="mx-auto mt-10 w-full max-w-2xl"
              role="search"
              aria-label="Search jobs"
            >
              <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-neutral-900/5 sm:flex-row sm:items-stretch">
                <label htmlFor="hero-search" className="sr-only">
                  Keywords or role
                </label>
                <input
                  id="hero-search"
                  type="search"
                  name="q"
                  placeholder="Job title, skill, or company"
                  className="min-h-12 w-full flex-1 rounded-xl border-0 bg-neutral-50 px-4 py-3 text-base text-neutral-900 outline-none ring-0 placeholder:text-neutral-400 focus:bg-white sm:min-w-0"
                />
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch">
                  <label htmlFor="hero-location" className="sr-only">
                    Location
                  </label>
                  <select
                    id="hero-location"
                    name="location"
                    className="min-h-12 w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/30 sm:w-44"
                    defaultValue=""
                  >
                    <option value="">Location</option>
                    <option value="remote">Remote</option>
                    <option value="us">United States</option>
                    <option value="ca">Canada</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">Europe</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1D9E75] px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] sm:px-10"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
              <span id="jobs" className="font-medium text-neutral-700">
                Jobs for professionals
              </span>
              <span className="hidden text-neutral-300 sm:inline" aria-hidden>
                ·
              </span>
              <span id="internships" className="font-medium text-neutral-700">
                Internships for students
              </span>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section
          className="border-b border-neutral-100 bg-white px-4 py-10 sm:px-6 lg:px-8"
          aria-label="Trust indicators"
        >
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3 sm:gap-6">
            <div className="text-center">
              <p className="text-lg font-bold leading-snug tracking-tight text-neutral-900 sm:text-xl">
                44,000+ verified listings
              </p>
            </div>
            <div className="text-center sm:border-x sm:border-neutral-100 sm:px-4">
              <p className="text-lg font-bold leading-snug tracking-tight text-neutral-900 sm:text-xl">
                Salary shown on every job
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold leading-snug tracking-tight text-neutral-900 sm:text-xl">
                Ghost jobs removed in 48hrs
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="how-heading"
                className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
              >
                How it works
              </h2>
              <p className="mt-3 text-lg text-neutral-600">
                From discovery to offer—built for speed and trust.
              </p>
            </div>
            <ol className="mx-auto mt-14 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
              <li className="relative text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D9E75]/10 text-lg font-bold text-[#1D9E75]">
                  1
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Post or browse
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Employers post verified roles; candidates explore jobs and
                  internships with filters that actually match how people search.
                </p>
              </li>
              <li className="relative text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D9E75]/10 text-lg font-bold text-[#1D9E75]">
                  2
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Apply in seconds
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  One profile, clear requirements, and compensation visible from
                  the start—no guessing games or endless forms.
                </p>
              </li>
              <li className="relative text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D9E75]/10 text-lg font-bold text-[#1D9E75]">
                  3
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  Get hired
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  We monitor listings so stale posts disappear fast—more real
                  conversations with teams that are hiring now.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section
          className="px-4 pb-20 pt-4 sm:px-6 lg:px-8"
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#1D9E75] px-6 py-14 text-center shadow-xl shadow-[#1D9E75]/25 sm:px-12 sm:py-16">
            <h2
              id="cta-heading"
              className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Join the board that respects your time
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-white/90">
              Create a free account to save searches, track applications, and get
              alerts when verified roles match your goals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                id="get-started"
                href="#"
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#1D9E75] shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                Sign up free
              </a>
              <a
                id="signin"
                href="#"
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl border-2 border-white/40 bg-transparent px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
              >
                Sign in
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 bg-neutral-50/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            <div id="companies" className="scroll-mt-24">
              <h2 className="text-base font-semibold text-neutral-900">Companies</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
                Discover employers hiring verified roles and internships. Company
                profiles highlight who they are, what they pay, and how they hire.
              </p>
            </div>
            <div id="salary" className="scroll-mt-24">
              <h2 className="text-base font-semibold text-neutral-900">Salary Guide</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
                Benchmark compensation by role, level, and location using data from
                listings where salary is always disclosed—not estimates hidden
                behind a paywall.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200/80 bg-neutral-50/80 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
              <span className="text-sm font-semibold text-[#1D9E75]">Clearpost</span>
              <span className="text-sm text-neutral-500">
                Verified jobs for professionals and students.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#companies" className="text-neutral-600 hover:text-neutral-900">
                Companies
              </a>
              <a href="#salary" className="text-neutral-600 hover:text-neutral-900">
                Salary Guide
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
