"use client";

import { useState, type FormEvent } from "react";

const PERKS = [
  { icon: "💰", title: "$25 per referral", desc: "Earn for every paying user you refer. No cap." },
  { icon: "🎓", title: "Resume credit", desc: "Free Pro access while active as an ambassador." },
  { icon: "🏆", title: "Top earner bonuses", desc: "Monthly bonuses for the top 3 ambassadors." },
  { icon: "📣", title: "Early access", desc: "First look at new features before public launch." },
  { icon: "🤝", title: "Network perks", desc: "Introductions to hiring managers and recruiters." },
  { icon: "📜", title: "Certificate", desc: "Official ambassador certificate for your portfolio." },
];

const STEPS = [
  { n: "1", title: "Apply below", desc: "Quick form, 2 minutes. We review within 48 hours." },
  { n: "2", title: "Get your link", desc: "We send you a personal referral link and ambassador kit." },
  { n: "3", title: "Share on campus", desc: "Classmates sign up. Every paying user earns you $25." },
  { n: "4", title: "Get paid", desc: "Monthly payouts via Stripe to your bank or debit card." },
];

export default function AmbassadorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [year, setYear] = useState("");
  const [why, setWhy] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, school, year, why }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to submit. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-white shadow-sm">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/sign-in" className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:block">Sign in</a>
            <a href="/sign-up" className="rounded-lg bg-[#1D9E75] px-4 py-2 text-sm font-semibold text-white hover:bg-[#188a66]">Get started</a>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-neutral-100 bg-gradient-to-b from-[#1D9E75]/8 to-white px-4 pb-20 pt-16 text-center sm:px-6 lg:px-8">
          <p className="mb-4 inline-flex items-center rounded-full border border-[#1D9E75]/20 bg-[#1D9E75]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#188a66]">
            Campus Ambassador Program
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Earn while you help <span className="text-[#1D9E75]">classmates find jobs</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-600">
            Represent Clearpost on your campus. Earn $25 for every verified paying user you refer. No experience needed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#apply" className="inline-flex rounded-xl bg-[#1D9E75] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#188a66]">
              Apply now — it&apos;s free
            </a>
            <a href="#how-it-works" className="inline-flex rounded-xl border border-neutral-200 px-8 py-3 text-base font-semibold text-neutral-700 hover:bg-neutral-50">
              How it works
            </a>
          </div>
        </section>

        <section className="border-b border-neutral-100 px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="perks-heading">
          <div className="mx-auto max-w-6xl">
            <h2 id="perks-heading" className="mb-10 text-center text-3xl font-bold tracking-tight text-neutral-900">
              Ambassador perks
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PERKS.map((p) => (
                <div key={p.title} className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="mt-3 text-base font-semibold text-neutral-900">{p.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-neutral-100 px-4 py-16 sm:px-6 lg:px-8 scroll-mt-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-neutral-900">How it works</h2>
            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.n} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D9E75]/10 text-xl font-bold text-[#1D9E75]">{s.n}</div>
                  <h3 className="font-semibold text-neutral-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="apply" className="px-4 py-20 sm:px-6 lg:px-8 scroll-mt-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Apply to be an ambassador</h2>
              <p className="mt-3 text-base text-neutral-600">Takes 2 minutes. We review every application within 48 hours.</p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-[#1D9E75]/30 bg-[#1D9E75]/8 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                    <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Application received!</h3>
                <p className="mt-2 text-neutral-600">We&apos;ll review your application and reach out to <strong>{email}</strong> within 48 hours.</p>
                <a href="/" className="mt-6 inline-flex rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]">Back to Clearpost</a>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="amb-name" className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
                    <input id="amb-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25" />
                  </div>
                  <div>
                    <label htmlFor="amb-email" className="mb-1.5 block text-sm font-medium text-neutral-700">School email (.edu)</label>
                    <input id="amb-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@university.edu" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25" />
                  </div>
                </div>

                <div>
                  <label htmlFor="amb-school" className="mb-1.5 block text-sm font-medium text-neutral-700">School / University</label>
                  <input id="amb-school" type="text" required value={school} onChange={(e) => setSchool(e.target.value)} placeholder="University of California, Berkeley" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25" />
                </div>

                <div>
                  <label htmlFor="amb-year" className="mb-1.5 block text-sm font-medium text-neutral-700">Year</label>
                  <select id="amb-year" required value={year} onChange={(e) => setYear(e.target.value)} className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25">
                    <option value="">Select year</option>
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                    <option>Graduate</option>
                    <option>PhD</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="amb-why" className="mb-1.5 block text-sm font-medium text-neutral-700">Why do you want to be an ambassador?</label>
                  <textarea id="amb-why" required rows={4} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Tell us why you're excited about Clearpost and how you'd spread the word on campus." className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25" />
                </div>

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

                <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Submitting…" : "Submit Application"}
                </button>

                <p className="text-center text-xs text-neutral-500">We&apos;ll review and email you within 48 hours.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-semibold text-[#1D9E75]">Clearpost</span>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="/" className="hover:text-neutral-900">Home</a>
            <a href="/jobs" className="hover:text-neutral-900">Jobs</a>
            <a href="/pricing" className="hover:text-neutral-900">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
