"use client";

import { supabase } from "@/lib/supabase";
import { use, useEffect, useState } from "react";

type Factor = {
  type: string;
  label: string;
  impact: "high" | "medium" | "low";
  detail: string;
  action: string;
};

type JobData = {
  id: string;
  company: string;
  companyInitials: string;
  title: string;
  jobType: string;
  location: string;
  locationType: string;
  experience: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  posted: string;
  description: string;
  requirements: string[];
  skills: string;
};

const FALLBACK_JOB: JobData = {
  id: "1",
  company: "Stripe",
  companyInitials: "ST",
  title: "Software Engineer, Payments Platform",
  jobType: "Full-time",
  location: "San Francisco, CA",
  locationType: "On-site",
  experience: "Senior",
  salary: "$195k – $265k",
  salaryMin: 195000,
  salaryMax: 265000,
  posted: "Apr 14, 2026",
  description:
    "Build reliable systems that move money at scale. This role focuses on product-quality engineering, performance, observability, and thoughtful API design.",
  requirements: [
    "5+ years building production web or backend systems.",
    "Strong fundamentals in data modeling, testing, and reliability.",
    "Experience shipping APIs used by external developers.",
    "Comfortable debugging across services and environments.",
  ],
  skills: "TypeScript, Go, PostgreSQL, Redis, Kafka",
};

function impactColor(impact: Factor["impact"]) {
  if (impact === "high") return "text-red-600 bg-red-50 border-red-100";
  if (impact === "medium") return "text-amber-700 bg-amber-50 border-amber-100";
  return "text-[#147b5b] bg-[#1D9E75]/6 border-[#1D9E75]/20";
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#1D9E75" : score >= 55 ? "#d97706" : "#ef4444";
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90" aria-hidden>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<JobData>(FALLBACK_JOB);
  const [isPro, setIsPro] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [userSalary, setUserSalary] = useState<number | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [responseStats, setResponseStats] = useState<{
    responseRate: number;
    avgDays: number | null;
    label: string;
  } | null>(null);
  const [jobFlagged, setJobFlagged] = useState(false);
  const [flagReasons, setFlagReasons] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      // Fetch real job data from Supabase
      const { data: jobRow } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (jobRow) {
        const raw = jobRow as Record<string, unknown>;
        setJob({
          id: String(raw.id ?? id),
          company: String(raw.company ?? ""),
          companyInitials: String(raw.company ?? "").slice(0, 2).toUpperCase(),
          title: String(raw.title ?? ""),
          jobType: String(raw.job_type ?? raw.jobType ?? "Full-time"),
          location: String(raw.location ?? ""),
          locationType: String(raw.location_type ?? raw.locationType ?? ""),
          experience: String(raw.experience ?? "Mid"),
          salary: raw.salary_min
            ? `$${Math.round(Number(raw.salary_min) / 1000)}k – $${Math.round(Number(raw.salary_max) / 1000)}k`
            : String(raw.salary ?? ""),
          salaryMin: Number(raw.salary_min ?? 0),
          salaryMax: Number(raw.salary_max ?? 0),
          posted: String(raw.posted_at ?? raw.created_at ?? "").slice(0, 10),
          description: String(raw.description ?? ""),
          requirements: [],
          skills: String(raw.required_skills ?? raw.skills ?? ""),
        });

        if (raw.flagged) {
          setJobFlagged(true);
          setFlagReasons(Array.isArray(raw.flag_reasons) ? (raw.flag_reasons as string[]) : []);
        }

        // Fetch employer response stats
        const employerId = String(raw.employer_id ?? "");
        if (employerId) {
          fetch(`/api/employer/response-stats?employerId=${encodeURIComponent(employerId)}`)
            .then((r) => r.ok ? r.json() : null)
            .then((data: { responseRate: number; avgDays: number | null; label: string; totalApplications: number } | null) => {
              if (data && data.totalApplications > 0) setResponseStats(data);
            })
            .catch(() => null);
        }
      }

      // Auth + subscription check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsSignedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_tier, skills, job_title, location, salary_expectation")
        .eq("id", user.id)
        .maybeSingle();

      const tier = profile?.subscription_tier as string | undefined;
      const isProUser =
        profile?.subscription_status === "active" &&
        (tier === "pro" || tier === "student_pro");
      setIsPro(isProUser);
      setUserSalary(profile?.salary_expectation ? Number(profile.salary_expectation) : null);

      const targetJob = jobRow ? job : FALLBACK_JOB;
      const userSkills = String(profile?.skills ?? "");
      const userTitle = String(profile?.job_title ?? "");
      const userLocation = String(profile?.location ?? "");

      // Compute match score
      const res = await fetch("/api/ai/match-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSkills,
          userTitle,
          userLocation,
          jobTitle: targetJob.title,
          jobSkills: targetJob.skills,
          jobLocation: targetJob.location,
          jobLocationType: targetJob.locationType,
          jobExperience: targetJob.experience,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { score: number; factors: Factor[] };
        setMatchScore(data.score);
        setFactors(data.factors);
      }
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (matchScore === null) return;
    const start = performance.now();
    const target = matchScore;
    function tick(now: number) {
      const t = Math.min((now - start) / 900, 1);
      setAnimatedScore(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [matchScore]);

  async function handleShowBreakdown() {
    if (!isPro) {
      window.location.href = "/pricing?from=match-breakdown";
      return;
    }
    setShowBreakdown((v) => !v);
    if (!showBreakdown && factors.length === 0) {
      setBreakdownLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("skills, job_title, location")
          .eq("id", user.id)
          .maybeSingle();

        const res = await fetch("/api/ai/match-breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSkills: String(profile?.skills ?? ""),
            userTitle: String(profile?.job_title ?? ""),
            userLocation: String(profile?.location ?? ""),
            jobTitle: job.title,
            jobSkills: job.skills,
            jobLocation: job.location,
            jobLocationType: job.locationType,
            jobExperience: job.experience,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { score: number; factors: Factor[] };
          setFactors(data.factors);
        }
      }
      setBreakdownLoading(false);
    }
  }

  const copiloUrl = `/dashboard/resume?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&salary=${encodeURIComponent(job.salary)}&skills=${encodeURIComponent(job.skills)}`;
  const salaryCoachUrl = `/dashboard/salary-coach?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}&salary=${encodeURIComponent(job.salary)}&salaryMin=${job.salaryMin}&salaryMax=${job.salaryMax}`;

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-neutral-500">
              <li><a href="/" className="hover:text-neutral-900">Home</a></li>
              <li className="text-neutral-300" aria-hidden>/</li>
              <li><a href="/jobs" className="hover:text-neutral-900">Jobs</a></li>
              <li className="text-neutral-300" aria-hidden>/</li>
              <li className="font-medium text-neutral-900">{job.title}</li>
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
                aria-label={`${job.company} logo`}
              >
                {job.companyInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-700">{job.company}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                    {job.title}
                  </h1>
                  <span className="inline-flex items-center rounded-full bg-[#1D9E75]/12 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#188a66]">
                    Verified
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[job.jobType, job.location, job.experience].filter(Boolean).map((tag) => (
                    <span key={tag} className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5">
                  <p className="text-2xl font-bold tracking-tight text-[#1D9E75] sm:text-3xl">{job.salary}</p>
                  <p className="mt-1 text-sm text-neutral-500">Posted {job.posted}</p>
                  {responseStats && (
                    <p className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${responseStats.responseRate >= 70 ? "text-[#147b5b] bg-[#1D9E75]/8" : responseStats.responseRate >= 40 ? "text-amber-700 bg-amber-50" : "text-neutral-500 bg-neutral-100"}`}>
                      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden>
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 3.5v2.75l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {responseStats.label}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Suspicious listing warning */}
            {jobFlagged && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden>
                    <path d="M10 2L1.5 17h17L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M10 8v4m0 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">This listing is under review</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                      Clearpost has flagged this listing for review before it goes fully live. Use caution and never pay fees or share sensitive personal information with employers.
                    </p>
                    {flagReasons.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {flagReasons.map((r) => (
                          <li key={r} className="flex items-start gap-1 text-xs text-amber-700">
                            <span className="font-bold">·</span>{r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Match panel — mobile */}
            {isSignedIn && matchScore !== null && (
              <div className="mt-6 block lg:hidden">
                <MatchPanel
                  score={matchScore}
                  isPro={isPro}
                  factors={factors}
                  showBreakdown={showBreakdown}
                  breakdownLoading={breakdownLoading}
                  onToggleBreakdown={() => void handleShowBreakdown()}
                />
              </div>
            )}

            <div className="mt-8 border-t border-neutral-200 pt-8 prose prose-neutral max-w-none">
              <h2 className="text-xl font-semibold text-neutral-900">About the role</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {job.description || "Full role description coming soon."}
              </p>

              {job.requirements.length > 0 && (
                <>
                  <h2 className="mt-8 text-xl font-semibold text-neutral-900">Requirements</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
                    {job.requirements.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </>
              )}

              {job.skills && (
                <>
                  <h2 className="mt-8 text-xl font-semibold text-neutral-900">Required skills</h2>
                  <p className="mt-3 text-sm text-neutral-600">{job.skills}</p>
                </>
              )}
            </div>
          </section>

          {/* Right column */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* CTA card */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                {isSignedIn ? (
                  <>
                    <a
                      href={copiloUrl}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66]"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                        <path d="M10 2a6 6 0 016 6c0 2.5-1.5 4.7-3.7 5.7L13 17H7l.7-3.3A6 6 0 014 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                      Build your co-pilot for this role
                    </a>
                    <p className="mt-2 text-center text-xs text-neutral-400">
                      Tailored to {job.company} — not generic AI
                    </p>
                  </>
                ) : (
                  <a
                    href={`/sign-in?next=/jobs/${id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66]"
                  >
                    Sign in to apply
                  </a>
                )}

                <a
                  href={`/apply/${id}`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                >
                  Quick apply
                </a>

                {isSignedIn && isPro && (
                  <a
                    href={salaryCoachUrl}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/5 px-4 py-2.5 text-sm font-semibold text-[#147b5b] transition-colors hover:bg-[#1D9E75]/10"
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                      <path d="M10 2v2m0 12v2M4.93 4.93l1.41 1.41m7.32 7.32l1.41 1.41M2 10h2m12 0h2M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    Salary negotiation coach
                  </a>
                )}

                <div className="mt-5 rounded-xl bg-neutral-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Salary</p>
                  <p className="mt-1 text-lg font-bold text-[#1D9E75]">{job.salary}</p>
                </div>
                <SalaryRangeBar min={job.salaryMin} max={job.salaryMax} userSalary={userSalary} />

                <ul className="mt-5 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Job highlights</p>
                  {[
                    { label: job.location, sub: "Location" },
                    { label: job.jobType, sub: "Type" },
                    { label: job.experience, sub: "Level" },
                    { label: job.posted, sub: "Posted" },
                  ].filter((x) => x.label).map((x) => (
                    <li key={x.sub} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{x.sub}</span>
                      <span className="font-medium text-neutral-900">{x.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Match panel — desktop */}
              {isSignedIn && matchScore !== null && (
                <div className="hidden lg:block">
                  <MatchPanel
                    score={animatedScore}
                    isPro={isPro}
                    factors={factors}
                    showBreakdown={showBreakdown}
                    breakdownLoading={breakdownLoading}
                    onToggleBreakdown={() => void handleShowBreakdown()}
                  />
                </div>
              )}

              {responseStats && (
                <EmployerTrustCard stats={responseStats} />
              )}

              {!isSignedIn && (
                <div className="rounded-2xl border border-dashed border-neutral-200 p-5 text-center">
                  <p className="text-sm font-medium text-neutral-700">See your match score</p>
                  <p className="mt-1 text-xs text-neutral-500">Sign in to see how well you fit this role</p>
                  <a href={`/sign-in?next=/jobs/${id}`} className="mt-3 inline-flex rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                    Sign in
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function MatchPanel({
  score,
  isPro,
  factors,
  showBreakdown,
  breakdownLoading,
  onToggleBreakdown,
}: {
  score: number;
  isPro: boolean;
  factors: Factor[];
  showBreakdown: boolean;
  breakdownLoading: boolean;
  onToggleBreakdown: () => void;
}) {
  const scoreColor = score >= 75 ? "text-[#1D9E75]" : score >= 55 ? "text-amber-600" : "text-red-600";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <ScoreRing score={score} />
          <span className={`absolute text-lg font-bold tabular-nums ${scoreColor}`}>{score}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">Your match score</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {score >= 75 ? "Strong fit for this role" : score >= 55 ? "Good fit with some gaps" : "Significant gaps — see breakdown"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleBreakdown}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
          isPro
            ? "border-[#1D9E75]/30 bg-[#1D9E75]/5 text-[#147b5b] hover:bg-[#1D9E75]/10"
            : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        }`}
      >
        {isPro ? (
          <>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 9V7m0-2v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {showBreakdown ? "Hide breakdown" : "Why this score?"}
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-amber-500" aria-hidden>
              <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.1L8 10.3l-3.8 2 .7-4.1L2 5.4l4.2-.6L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
            See what&apos;s holding you back — Pro
          </>
        )}
      </button>

      {isPro && showBreakdown && (
        <div className="mt-4 space-y-3">
          {breakdownLoading ? (
            <p className="text-center text-xs text-neutral-500">Analyzing…</p>
          ) : factors.length === 0 ? (
            <p className="text-xs text-neutral-500">No significant gaps detected.</p>
          ) : (
            factors.map((f, i) => (
              <div key={i} className={`rounded-xl border p-3 ${impactColor(f.impact)}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold">{f.label}</p>
                  <span className={`text-xs font-bold uppercase ${f.impact === "high" ? "text-red-600" : f.impact === "medium" ? "text-amber-700" : "text-[#147b5b]"}`}>
                    {f.impact}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{f.detail}</p>
                <p className="mt-2 text-xs font-semibold">
                  → {f.action}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {!isPro && (
        <p className="mt-3 text-center text-xs text-neutral-400">
          <a href="/pricing" className="font-semibold text-[#1D9E75] hover:underline">Upgrade to Pro</a> to see exactly what skills, experience, and location gaps are dragging your score down — and how to close them.
        </p>
      )}
    </div>
  );
}

function SalaryRangeBar({ min, max, userSalary }: { min: number; max: number; userSalary: number | null }) {
  if (!min || !max || min >= max) return null;
  const pct = userSalary != null ? Math.min(100, Math.max(0, ((userSalary - min) / (max - min)) * 100)) : null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  const placement = pct == null ? null : pct < 33 ? "lower end" : pct > 67 ? "upper end" : "mid range";
  const inRange = userSalary != null && userSalary >= min && userSalary <= max;
  return (
    <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Salary range</p>
      <div className="relative h-2 overflow-visible rounded-full bg-neutral-200">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-[#1D9E75]/30 to-[#1D9E75]" />
        {pct != null && (
          <div
            className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#1D9E75] bg-white shadow"
            style={{ left: `${pct}%` }}
            title={`Your salary: ${fmt(userSalary!)}`}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-neutral-400">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>
      {pct != null && (
        <p className="mt-1 text-center text-[11px] text-neutral-500">
          Your {fmt(userSalary!)} — {inRange ? placement : userSalary! < min ? "below range" : "above range"}
        </p>
      )}
    </div>
  );
}

function EmployerTrustCard({ stats }: { stats: { responseRate: number; avgDays: number | null } }) {
  const tier = stats.responseRate >= 70 ? "high" : stats.responseRate >= 40 ? "medium" : "low";
  const color = tier === "high" ? "text-[#147b5b]" : tier === "medium" ? "text-amber-700" : "text-neutral-500";
  const bg = tier === "high" ? "bg-[#1D9E75]/8" : tier === "medium" ? "bg-amber-50" : "bg-neutral-100";
  const dot = tier === "high" ? "bg-[#1D9E75]" : tier === "medium" ? "bg-amber-400" : "bg-neutral-400";
  const bar = tier === "high" ? "bg-[#1D9E75]" : tier === "medium" ? "bg-amber-400" : "bg-neutral-300";
  const label = tier === "high" ? "Highly responsive" : tier === "medium" ? "Moderately responsive" : "Low response rate";
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Employer reputation</p>
      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${color} ${bg}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-600">
            <span>Response rate</span>
            <span className={color}>{stats.responseRate}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className={`h-1.5 rounded-full transition-all duration-700 ${bar}`} style={{ width: `${stats.responseRate}%` }} />
          </div>
        </div>
        {stats.avgDays != null && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Avg. time to respond</span>
            <span className="font-semibold text-neutral-800">{stats.avgDays}d</span>
          </div>
        )}
      </div>
    </div>
  );
}
