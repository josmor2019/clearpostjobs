import { JobCard } from "@/components/JobCard";
import { MobileNav } from "@/components/MobileNav";
import { JOBS } from "@/lib/jobs";

const COMPANY_LOGOS = [
  "Stripe", "Anthropic", "Notion", "Figma", "Linear",
  "Vercel", "Airbnb", "GitHub", "Supabase", "Loom",
];

const WHY_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Every listing is verified",
    body: "Our team manually checks every job post before it goes live. No scraped listings, no duplicates, no fake roles.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Ghost jobs removed in 48h",
    body: "Stale listings are automatically expired. Everything you see is actively hiring right now.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    title: "Salary shown on every role",
    body: "No 'competitive salary' vagueness. Every listing on Clearpost shows the real pay range upfront.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <nav className="mx-auto flex h-[57px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Primary">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] shadow-sm">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Clearpost</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {[
              { label: "Browse Jobs", href: "/jobs" },
              { label: "Internships", href: "/internships" },
              { label: "Companies", href: "#companies" },
              { label: "Salary Guide", href: "#salary" },
              { label: "Pricing", href: "/pricing" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/sign-in"
              className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 sm:inline-flex"
            >
              Sign in
            </a>
            <a
              href="/sign-up"
              className="hidden rounded-xl bg-[#1D9E75] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] sm:inline-flex"
            >
              Get started →
            </a>
            <MobileNav />
          </div>
        </nav>
      </header>

      <main>

        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden border-b border-neutral-100 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          {/* Ambient background */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#F0FBF7] to-transparent" />
            <div className="absolute left-1/2 top-[-80px] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#1D9E75]/6 blur-3xl" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            {/* Pill badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1D9E75]/25 bg-[#1D9E75]/8 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1D9E75]" />
              <span className="text-xs font-semibold tracking-wider text-[#188a66] uppercase">44,000+ verified listings</span>
            </div>

            {/* Headline */}
            <h1 className="text-balance text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-[4.25rem] lg:leading-[1.08]">
              Find jobs that are<br className="hidden sm:block" />
              <span className="text-[#1D9E75]"> actually real.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-600 sm:text-xl">
              Every listing verified by our team. Salary shown on every role.
              Ghost jobs gone within 48 hours — automatically.
            </p>

            {/* Search form */}
            <form
              className="mx-auto mt-10 w-full max-w-2xl"
              role="search"
              aria-label="Search jobs"
              action="/jobs"
              method="get"
            >
              <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-neutral-900/5 sm:flex-row">
                <div className="relative flex-1">
                  <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <label htmlFor="hero-search" className="sr-only">Keywords or role</label>
                  <input
                    id="hero-search"
                    type="search"
                    name="q"
                    placeholder="Job title, skill, or company"
                    className="h-12 w-full rounded-xl border-0 bg-neutral-50 pl-10 pr-4 text-[15px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:bg-white"
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <label htmlFor="hero-location" className="sr-only">Location</label>
                  <select
                    id="hero-location"
                    name="location"
                    className="h-12 cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 text-[15px] text-neutral-700 outline-none transition focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25 sm:w-40"
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
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-[#1D9E75] px-8 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66]"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick links */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-neutral-400">Popular:</span>
              {["Software Engineer", "Product Manager", "Data Scientist", "Design"].map((term) => (
                <a
                  key={term}
                  href={`/jobs?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-[#1D9E75]/40 hover:text-[#188a66]"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Trust bar ─── */}
        <section className="border-b border-neutral-100 bg-white px-4 py-8 sm:px-6 lg:px-8" aria-label="Why Clearpost">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8">
            {[
              { icon: "✓", label: "Verified listings only", desc: "Every job post manually reviewed before going live" },
              { icon: "$", label: "Salary on every job", desc: "No 'competitive compensation' — real numbers, always" },
              { icon: "⏱", label: "Ghost jobs removed in 48h", desc: "Stale posts auto-expire so you never chase a dead role" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#188a66] text-base font-bold">
                  {icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Company logos strip ─── */}
        <section className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-10 sm:px-6 lg:px-8" aria-label="Trusted by professionals at">
          <div className="mx-auto max-w-5xl">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Trusted by professionals from
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {COMPANY_LOGOS.map((name) => (
                <span key={name} className="text-sm font-semibold text-neutral-400 transition-colors hover:text-neutral-600">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured jobs ─── */}
        <section className="border-b border-neutral-100 px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="featured-jobs-heading">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#188a66]">Featured roles</p>
                <h2 id="featured-jobs-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                  Hand-picked jobs this week
                </h2>
                <p className="mt-2 text-neutral-600">
                  Verified roles with salary shown — no ghost listings.
                </p>
              </div>
              <a
                href="/jobs"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:shadow"
              >
                View all jobs
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {JOBS.slice(0, 6).map((job) => (
                <li key={job.id}>
                  <JobCard job={job} titleTag="h3" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Why Clearpost ─── */}
        <section className="border-b border-neutral-100 bg-neutral-50/50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="why-heading">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#188a66]">The difference</p>
              <h2 id="why-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Built on a single promise
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {WHY_ITEMS.map(({ icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75]">
                    {icon}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="how-heading">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#188a66]">Process</p>
              <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                From search to offer
              </h2>
            </div>
            <ol className="relative grid gap-8 sm:grid-cols-3 sm:gap-10">
              {/* Connecting line on desktop */}
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-neutral-200 sm:block" aria-hidden style={{ left: "calc(16.67% + 2rem)", right: "calc(16.67% + 2rem)" }} />
              {[
                { n: "01", title: "Browse verified jobs", body: "Every listing is checked by our team before it goes live. Filter by salary, role, experience, and location." },
                { n: "02", title: "Apply in one tap", body: "One profile. One click. Salary and requirements shown upfront — no surprises." },
                { n: "03", title: "Get hired faster", body: "Real-time application tracking, interview alerts, and ghosting protection built in." },
              ].map(({ n, title, body }) => (
                <li key={n} className="relative text-center">
                  <div className="relative mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-2 ring-[#1D9E75]/20 shadow-sm">
                    <span className="text-sm font-bold text-[#1D9E75]">{n}</span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── For students / For employers ─── */}
        <section className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">For students</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Browse verified internships with real stipends shown. AI co-pilot helps you tailor your resume and cover letter to each specific listing.
              </p>
              <a href="/internships" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#147b5b]">
                Browse internships
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900">For employers</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Post verified listings in minutes. Your response rate and salary accuracy are public — it keeps you accountable and builds candidate trust.
              </p>
              <a href="/employer/sign-up" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D9E75] hover:text-[#147b5b]">
                Post a job
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#1D9E75] px-6 py-14 text-center shadow-2xl shadow-[#1D9E75]/30 sm:px-12 sm:py-16">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#188a66]/50 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#147b5b]/50 blur-3xl" />
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/70">Join 50,000+ job seekers</p>
            <h2 id="cta-heading" className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The board that respects your time
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-white/85">
              Free account to save searches, track applications, and get priority alerts when verified roles match your profile.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/sign-up"
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl bg-white px-8 py-3.5 text-[15px] font-semibold text-[#1D9E75] shadow-sm transition-all hover:bg-neutral-50 hover:shadow sm:w-auto"
              >
                Sign up free
              </a>
              <a
                href="/jobs"
                className="inline-flex w-full min-w-[200px] items-center justify-center rounded-xl border-2 border-white/35 px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-white/10 sm:w-auto"
              >
                Browse jobs first →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-neutral-100 bg-neutral-50/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="/" className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] shadow-sm">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold text-neutral-900">Clearpost</span>
              </a>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Verified jobs for professionals and students. Every salary shown, every listing real.
              </p>
            </div>

            {/* Job seekers */}
            <div id="companies" className="scroll-mt-24">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Job seekers</h3>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "Browse Jobs", href: "/jobs" },
                  { label: "Internships", href: "/internships" },
                  { label: "Salary Guide", href: "#salary" },
                  { label: "Application Tracker", href: "/dashboard/applications" },
                  { label: "Pricing", href: "/pricing" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-neutral-600 hover:text-neutral-900">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Employers */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Employers</h3>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "Post a Job", href: "/employer/post-job" },
                  { label: "Employer Dashboard", href: "/employer/dashboard" },
                  { label: "Pricing Plans", href: "/pricing" },
                  { label: "Employer Sign Up", href: "/employer/sign-up" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-neutral-600 hover:text-neutral-900">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div id="salary" className="scroll-mt-24">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Company</h3>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "About", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Contact", href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-neutral-600 hover:text-neutral-900">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200/80 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-neutral-400 sm:flex-row">
            <span>© 2026 Clearpost. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-neutral-600">Privacy</a>
              <a href="#" className="hover:text-neutral-600">Terms</a>
              <a href="#" className="hover:text-neutral-600">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
