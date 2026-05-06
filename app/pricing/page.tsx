"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type PlanId = "pro" | "student-pro" | "employer-featured" | "employer-unlimited";

const PRICE_IDS = {
  pro: "price_1TQbsH48dhA06sxFnRlOrQOf",
  student_pro: "price_1TQcSZ48dhA06sxFXCslQB7v",
  employer_featured: "price_1TQcE248dhA06sxFC115wsei",
  employer_unlimited: "price_1TQcGC48dhA06sxFUwuRvQSo",
} as const;

type Feature = {
  text: string;
  pro?: boolean;
};

function Check({ pro }: { pro?: boolean }) {
  return (
    <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${pro ? "bg-[#1D9E75]/15 text-[#1D9E75]" : "text-[#1D9E75]"}`}>
      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
        <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const JOB_SEEKER_PRO_FEATURES: Feature[] = [
  { text: "Unlimited applications (free tier: 3/month)" },
  { text: "Application co-pilot — tailored to each specific job listing", pro: true },
  { text: "Knows the real salary, required skills, and company context automatically", pro: true },
  { text: "Match score breakdown — see exactly what gaps are dragging your score down", pro: true },
  { text: "Salary negotiation coach trained on verified Clearpost salary data", pro: true },
  { text: "Priority alerts — see new listings 24 hours before free users", pro: true },
  { text: "Resume and cover letter tailored to the listing — not generic AI", pro: true },
  { text: "Application tracker across all applies with status updates" },
  { text: "AI detection score before you submit" },
];

const STUDENT_PRO_FEATURES: Feature[] = [
  { text: "Unlimited internship applications (free tier: 3/month)" },
  { text: "Application co-pilot for each specific internship listing — one tap", pro: true },
  { text: "Knows the stipend, required skills, and company context automatically", pro: true },
  { text: "Confidence score breakdown — exactly what the gap is and how to close it", pro: true },
  { text: "Priority visibility to campus ambassadors and employer events", pro: true },
  { text: "AI detection score before submitting any document", pro: true },
  { text: "Application tracker across all internship applies" },
  { text: ".edu verification badge on your profile" },
  { text: "Professor recommendation letter generator" },
];

const EMPLOYER_FEATURED_FEATURES: Feature[] = [
  { text: "Single featured listing with priority placement" },
  { text: "4x more candidate visibility vs. standard listing" },
  { text: "Verified employer badge on your listing" },
  { text: "48hr ghost job removal — employer confirms or listing pauses" },
  { text: "Applicant review pipeline with status management" },
];

const EMPLOYER_UNLIMITED_FEATURES: Feature[] = [
  { text: "Unlimited featured listings — post as many roles as you need" },
  { text: "AI applicant ranking against your specific requirements" },
  { text: "Full candidate search and messaging" },
  { text: "Ghost job removal every 48hrs — keeps your pipeline clean" },
  { text: "Founding employer rate — locked in as long as you stay subscribed" },
  { text: "Priority support and dedicated onboarding" },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: PlanId, priceId: string) {
    setError(null);
    setLoadingPlan(planId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/sign-in?redirect=/pricing`;
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? "Unable to start checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <header className="border-b border-neutral-100 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D9E75] text-white shadow-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/jobs" className="font-medium text-neutral-600 hover:text-neutral-900">Jobs</a>
            <a href="/sign-in" className="rounded-xl border border-neutral-200 px-4 py-2 font-semibold text-neutral-700 hover:bg-neutral-50">Sign in</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-4 text-center">
          <span className="inline-flex rounded-full border border-[#1D9E75]/30 bg-[#1D9E75]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#147b5b]">
            Clearpost Pro
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Your application co-pilot.<br className="hidden sm:block" />
            <span className="text-[#1D9E75]">For every specific job.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-neutral-600 sm:text-lg">
            ChatGPT gives you generic advice. Clearpost knows the <strong>exact salary</strong>, <strong>required skills</strong>, and <strong>company context</strong> of the role you&apos;re applying to — automatically, without copying anything.
          </p>
        </div>

        {/* Comparison callout */}
        <div className="mx-auto mb-12 mt-8 max-w-3xl rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Generic AI (ChatGPT, etc.)</p>
              <ul className="space-y-1.5 text-sm text-neutral-600">
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>You manually copy salary, JD, company details</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>Has no idea why your match score is low</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>Cannot see real salary data from employers</li>
                <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✗</span>Generic negotiation scripts</li>
              </ul>
            </div>
            <div className="rounded-xl border border-[#1D9E75]/30 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1D9E75] mb-2">Clearpost Pro</p>
              <ul className="space-y-1.5 text-sm text-neutral-600">
                <li className="flex items-start gap-2"><span className="text-[#1D9E75] mt-0.5">✓</span>One tap from a listing — all context pre-filled</li>
                <li className="flex items-start gap-2"><span className="text-[#1D9E75] mt-0.5">✓</span>Tells you exactly which gaps are dragging your score</li>
                <li className="flex items-start gap-2"><span className="text-[#1D9E75] mt-0.5">✓</span>Salary coach trained on verified employer data</li>
                <li className="flex items-start gap-2"><span className="text-[#1D9E75] mt-0.5">✓</span>Priority alerts — see new listings 24h early</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <p className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        {/* Pricing cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* Job Seeker Pro */}
          <article className="relative flex flex-col rounded-2xl border-2 border-[#1D9E75] bg-white p-6 shadow-lg shadow-[#1D9E75]/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1D9E75] px-4 py-1 text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap">
              Most popular
            </span>
            <div className="mb-4 mt-2">
              <h2 className="text-lg font-bold text-neutral-900">Job Seeker Pro</h2>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-neutral-900">$9</span>
                <span className="text-sm font-medium text-neutral-500 mb-1">/month</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">For professionals who want an unfair advantage on every application.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {JOB_SEEKER_PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check pro={f.pro} />
                  <span className={f.pro ? "font-medium" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handleCheckout("pro", PRICE_IDS.pro)}
              disabled={loadingPlan !== null}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "pro" ? "Redirecting…" : "Get Job Seeker Pro"}
            </button>
          </article>

          {/* Student Pro */}
          <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900">Student Pro</h2>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-neutral-900">$5</span>
                <span className="text-sm font-medium text-neutral-500 mb-1">/month</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">For students who want a co-pilot for every internship application.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {STUDENT_PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check pro={f.pro} />
                  <span className={f.pro ? "font-medium" : ""}>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handleCheckout("student-pro", PRICE_IDS.student_pro)}
              disabled={loadingPlan !== null}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#1D9E75] bg-white px-4 py-3 text-sm font-semibold text-[#1D9E75] transition-colors hover:bg-[#1D9E75]/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "student-pro" ? "Redirecting…" : "Get Student Pro"}
            </button>
          </article>

          {/* Employer Featured */}
          <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-neutral-900">Employer Featured</h2>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-neutral-900">$149</span>
                <span className="text-sm font-medium text-neutral-500 mb-1">/mo</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">Boost a single listing. Get in front of active, qualified candidates.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {EMPLOYER_FEATURED_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handleCheckout("employer-featured", PRICE_IDS.employer_featured)}
              disabled={loadingPlan !== null}
              className="inline-flex w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "employer-featured" ? "Redirecting…" : "Get Employer Featured"}
            </button>
          </article>

          {/* Employer Unlimited */}
          <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <span className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white mb-2">
                Best value
              </span>
              <h2 className="text-lg font-bold text-neutral-900">Employer Unlimited</h2>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-neutral-900">$349</span>
                <span className="text-sm font-medium text-neutral-500 mb-1">/mo</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">Unlimited featured listings. Full hiring suite.</p>
            </div>
            <ul className="flex-1 space-y-2.5 mb-6">
              {EMPLOYER_UNLIMITED_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <Check />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handleCheckout("employer-unlimited", PRICE_IDS.employer_unlimited)}
              disabled={loadingPlan !== null}
              className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPlan === "employer-unlimited" ? "Redirecting…" : "Get Employer Unlimited"}
            </button>
          </article>
        </div>

        {/* Free tier note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-500">
            Free tier: 3 applications/month, match score (number only), browse all jobs and internships.
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            All plans include a 30-day cancellation. No contracts.
          </p>
        </div>

        {/* FAQ / framing */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              q: "What is an 'application co-pilot'?",
              a: "When you click 'Build your co-pilot' on any job listing, Clearpost pre-fills your resume and cover letter with the real salary, required skills, and company context from that listing. ChatGPT cannot do this — it only knows what you manually paste in.",
            },
            {
              q: "Why is the match breakdown Pro only?",
              a: "Free users see their match score (e.g. 74%). Pro users see exactly what's dragging the score down — missing skills, title level gap, location mismatch — and a specific action to close each gap.",
            },
            {
              q: "What is the salary coach?",
              a: "It generates a negotiation script trained on verified salary data from Clearpost employer listings. It gives you the specific counter-offer number, the exact words to say on the call, and alternative levers if salary is capped.",
            },
            {
              q: "What does 'priority alerts' mean?",
              a: "New listings are surfaced to Pro users 24 hours before they appear in the free feed. Being early means applying before the inbox fills up.",
            },
            {
              q: "What is the application tracker?",
              a: "A dashboard showing every application you've submitted through Clearpost, with status updates as employers move your application through their pipeline.",
            },
            {
              q: "Is there a student discount?",
              a: "Student Pro is $5/month and includes a .edu email verification for student-only internships. Same co-pilot features as Job Seeker Pro, built for internship workflows.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-sm font-semibold text-neutral-900">{item.q}</p>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
