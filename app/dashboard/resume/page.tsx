"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, Suspense } from "react";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

const textareaClass = `${inputClass} min-h-[120px] resize-y`;

function LabeledField({ id, label, children }: { id?: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

type DetectResult = {
  aiScore?: number;
  verdict?: string;
  signals?: string[];
  recommendation?: string;
};

function ResumePageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const jobId = params.get("jobId") ?? "";
  const jobTitle = params.get("jobTitle") ?? "";
  const company = params.get("company") ?? "";
  const salary = params.get("salary") ?? "";
  const jobSkills = params.get("skills") ?? "";

  const isJobContext = Boolean(jobTitle && company);

  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState(jobTitle);
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");

  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detect, setDetect] = useState<DetectResult | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { router.replace("/sign-in"); return; }
      setEmail(user.email ?? "");
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      if (typeof meta?.full_name === "string") setName(meta.full_name);

      supabase.from("profiles").select("full_name, job_title, skills, bio").eq("id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            if (data.full_name) setName(String(data.full_name));
            if (data.job_title) setTitle(String(data.job_title));
            if (data.skills) setSkills(String(data.skills));
            if (data.bio) setSummary(String(data.bio));
          }
        });

      setAuthChecked(true);
    });
  }, [router]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setGenError(null);
    setResume(null);
    setDetect(null);
    setGenerating(true);

    const res = await fetch("/api/ai/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        title,
        targetRole: isJobContext ? `${jobTitle} at ${company}` : targetRole,
        summary,
        experience: isJobContext
          ? `${experience}\n\nTarget role context: ${jobTitle} at ${company}. Required skills: ${jobSkills}. Salary range: ${salary}. Tailor this resume specifically for this role.`
          : experience,
        education,
        skills: isJobContext ? `${skills}\n\nRole requires: ${jobSkills}` : skills,
      }),
    });

    setGenerating(false);

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setGenError(err.error ?? "Generation failed.");
      return;
    }

    const data = (await res.json()) as { resume?: string };
    setResume(data.resume ?? "");
  }

  async function handleDetect() {
    if (!resume) return;
    setDetecting(true);
    setDetect(null);
    const res = await fetch("/api/ai/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resume }),
    });
    setDetecting(false);
    if (res.ok) {
      const data = (await res.json()) as DetectResult;
      setDetect(data);
    }
  }

  function handleCopy() {
    if (resume) void navigator.clipboard.writeText(resume);
  }

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-50"><p className="text-sm text-neutral-500">Loading…</p></div>;
  }

  const pageTitle = isJobContext
    ? `Your application co-pilot for ${jobTitle} at ${company}`
    : "Application co-pilot — resume builder";

  const pageSubtitle = isJobContext
    ? `Tailored to the exact salary, skills, and role context of this listing — not generic AI advice.`
    : "Build a resume tailored to a specific job. For best results, open this from a job listing.";

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white p-5 lg:block">
        <a href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D9E75] text-sm font-bold text-white">C</span>
          <span className="text-lg font-semibold tracking-tight text-[#1D9E75]">Clearpost</span>
        </a>
        <nav className="space-y-1">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard/resume", label: "Resume co-pilot", active: true },
            { href: "/dashboard/cover-letter", label: "Cover letter co-pilot" },
            { href: "/dashboard/salary-coach", label: "Salary coach" },
            { href: "/jobs", label: "Browse Jobs" },
          ].map(({ href, label, active }) => (
            <a key={href} href={href}
              className={`inline-flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-[#1D9E75]/10 text-[#188a66]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >{label}</a>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-auto min-h-16 max-w-5xl flex-col justify-center gap-1 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-neutral-900 leading-tight">{pageTitle}</h1>
                <p className="text-xs text-neutral-500 mt-0.5">{pageSubtitle}</p>
              </div>
              <a href={`/dashboard/cover-letter${isJobContext ? `?jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(company)}&salary=${encodeURIComponent(salary)}&skills=${encodeURIComponent(jobSkills)}` : ""}`}
                className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                Cover letter →
              </a>
            </div>
            {isJobContext && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[company, jobTitle, salary].filter(Boolean).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#1D9E75]/8 px-2 py-0.5 text-xs font-medium text-[#147b5b]">{tag}</span>
                ))}
                {jobSkills.split(",").slice(0, 3).filter(Boolean).map((s) => (
                  <span key={s} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!isJobContext && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <span className="font-semibold text-amber-800">Tip:</span>
              <span className="text-amber-700"> For a co-pilot tailored to a specific job — including the real salary range and required skills — open this from a job listing page.</span>
              <a href="/jobs" className="ml-2 font-semibold text-[#1D9E75] hover:underline">Browse jobs →</a>
            </div>
          )}

          <div className="grid gap-8 xl:grid-cols-2">
            <form onSubmit={(e) => void handleGenerate(e)} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Your details</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {isJobContext
                    ? `Your co-pilot will tailor every section specifically for ${jobTitle} at ${company}.`
                    : "Fill in your information to generate a polished, targeted resume."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledField id="r-name" label="Full name">
                  <input id="r-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className={inputClass} />
                </LabeledField>
                <LabeledField id="r-email" label="Email">
                  <input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className={inputClass} />
                </LabeledField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <LabeledField id="r-title" label="Current title">
                  <input id="r-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Software Engineer" className={inputClass} />
                </LabeledField>
                {!isJobContext && (
                  <LabeledField id="r-target" label="Target role">
                    <input id="r-target" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Staff Engineer" className={inputClass} />
                  </LabeledField>
                )}
                {isJobContext && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700">Target role</label>
                    <div className="flex items-center rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/5 px-4 py-2.5 text-sm font-medium text-[#147b5b]">
                      {jobTitle} at {company}
                    </div>
                  </div>
                )}
              </div>

              <LabeledField id="r-summary" label="Professional summary">
                <textarea id="r-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief overview of your career and what you bring to a team." className={textareaClass} rows={3} />
              </LabeledField>

              <LabeledField id="r-exp" label="Work experience">
                <textarea id="r-exp" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Company, role, dates, key accomplishments. One job per paragraph." className={textareaClass} rows={5} />
              </LabeledField>

              <LabeledField id="r-edu" label="Education">
                <textarea id="r-edu" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Degree, school, graduation year" className={inputClass} rows={2} />
              </LabeledField>

              <LabeledField id="r-skills" label="Your skills">
                <input id="r-skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, PostgreSQL, Docker" className={inputClass} />
                {isJobContext && jobSkills && (
                  <p className="mt-1 text-xs text-[#1D9E75]">Role requires: {jobSkills}</p>
                )}
              </LabeledField>

              {genError ? <p className="text-sm font-medium text-red-600">{genError}</p> : null}

              <button
                type="submit"
                disabled={generating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? "Generating…" : isJobContext ? `Build co-pilot for ${company}` : "Generate resume"}
              </button>
            </form>

            <div className="space-y-4">
              {resume ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-neutral-900">
                      {isJobContext ? `Co-pilot resume — ${company}` : "Generated resume"}
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Copy</button>
                      <button onClick={() => void handleDetect()} disabled={detecting}
                        className="rounded-lg bg-[#1D9E75]/10 px-3 py-1.5 text-xs font-semibold text-[#188a66] hover:bg-[#1D9E75]/20 disabled:opacity-60">
                        {detecting ? "Analyzing…" : "AI score"}
                      </button>
                    </div>
                  </div>
                  <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-neutral-50 p-4 text-xs text-neutral-800 font-mono leading-relaxed">
                    {resume}
                  </pre>

                  {detect && (
                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900">AI detection score</h3>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          (detect.aiScore ?? 0) < 30 ? "bg-emerald-100 text-emerald-700"
                          : (detect.aiScore ?? 0) < 60 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                          {detect.aiScore ?? 0}% AI — {detect.verdict}
                        </span>
                      </div>
                      {detect.signals?.map((s) => (
                        <p key={s} className="text-xs text-neutral-600 flex items-start gap-1.5">
                          <span className="mt-0.5 text-neutral-400">•</span>{s}
                        </p>
                      ))}
                      {detect.recommendation && (
                        <p className="mt-3 text-xs font-medium text-[#188a66]">{detect.recommendation}</p>
                      )}
                    </div>
                  )}

                  {isJobContext && (
                    <div className="mt-4 rounded-xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 p-4">
                      <p className="text-xs font-semibold text-[#147b5b]">Next: cover letter for this role →</p>
                      <a
                        href={`/dashboard/cover-letter?jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(company)}&salary=${encodeURIComponent(salary)}&skills=${encodeURIComponent(jobSkills)}`}
                        className="mt-2 inline-flex rounded-lg bg-[#1D9E75] px-4 py-2 text-xs font-semibold text-white hover:bg-[#188a66]"
                      >
                        Build cover letter co-pilot
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white">
                  <div className="text-center px-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                        <path d="M9 12h6M9 16h6M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M9 4a2 2 0 002 2h2a2 2 0 002-2M9 4a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700">
                      {isJobContext ? `Your ${company} co-pilot will appear here` : "Your resume will appear here"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {isJobContext ? "Tailored to the real job, salary, and required skills" : "Fill in your details and click Generate"}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                  {isJobContext ? `Why this beats ChatGPT for ${company}` : "Why this beats generic AI tools"}
                </h3>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {(isJobContext ? [
                    `Knows the exact salary range: ${salary}`,
                    `Targets required skills: ${jobSkills.split(",").slice(0, 3).join(", ")}`,
                    "ChatGPT requires you to manually copy all of this — Clearpost does it in one tap",
                    "AI detection score included so your resume reads authentically human",
                    "Connected to your match score — see what gaps to address in your summary",
                  ] : [
                    "Open from a job listing to unlock job-specific tailoring",
                    "Knows the real salary, required skills, and company context",
                    "AI detection score so your resume reads authentically",
                    "ChatGPT cannot access Clearpost listing data — we can",
                  ]).map((tip) => (
                    <li key={tip} className="flex items-start gap-1.5">
                      <span className="mt-0.5 font-bold text-[#1D9E75]">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense>
      <ResumePageInner />
    </Suspense>
  );
}
