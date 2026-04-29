"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, Suspense } from "react";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

type Tone = "professional" | "friendly" | "bold";

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional", label: "Professional", desc: "Formal, polished" },
  { value: "friendly", label: "Friendly", desc: "Warm, approachable" },
  { value: "bold", label: "Bold", desc: "Confident, direct" },
];

type DetectResult = {
  aiScore?: number;
  verdict?: string;
  signals?: string[];
  recommendation?: string;
};

function CoverLetterInner() {
  const router = useRouter();
  const params = useSearchParams();

  const jobId = params.get("jobId") ?? "";
  const jobTitleParam = params.get("jobTitle") ?? "";
  const companyParam = params.get("company") ?? "";
  const salary = params.get("salary") ?? "";
  const jobSkills = params.get("skills") ?? "";

  const isJobContext = Boolean(jobTitleParam && companyParam);

  const [authChecked, setAuthChecked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState(jobTitleParam);
  const [company, setCompany] = useState(companyParam);
  const [jobDescription, setJobDescription] = useState(
    jobSkills ? `Required skills: ${jobSkills}${salary ? `\nSalary range: ${salary}` : ""}` : ""
  );
  const [background, setBackground] = useState("");
  const [tone, setTone] = useState<Tone>("professional");

  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detect, setDetect] = useState<DetectResult | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { router.replace("/sign-in"); return; }
      setEmail(user.email ?? "");
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      if (typeof meta?.full_name === "string") setName(meta.full_name);

      supabase.from("profiles").select("full_name, bio, skills").eq("id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            if (data.full_name) setName(String(data.full_name));
            if (data.bio) setBackground(String(data.bio));
          }
        });

      setAuthChecked(true);
    });
  }, [router]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setGenError(null);
    setLetter(null);
    setDetect(null);
    setGenerating(true);

    const enrichedDescription = isJobContext
      ? [
          jobDescription,
          `Required skills: ${jobSkills}`,
          salary ? `Salary range: ${salary}` : "",
          `This is a verified listing on Clearpost. Tailor the letter specifically to ${company}'s culture and this exact role.`,
        ].filter(Boolean).join("\n")
      : jobDescription;

    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        jobTitle,
        company,
        jobDescription: enrichedDescription,
        userBackground: background,
        tone,
      }),
    });

    setGenerating(false);

    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      setGenError(err.error ?? "Generation failed.");
      return;
    }

    const data = (await res.json()) as { coverLetter?: string };
    setLetter(data.coverLetter ?? "");
  }

  async function handleDetect() {
    if (!letter) return;
    setDetecting(true);
    const res = await fetch("/api/ai/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: letter }),
    });
    setDetecting(false);
    if (res.ok) setDetect((await res.json()) as DetectResult);
  }

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-50"><p className="text-sm text-neutral-500">Loading…</p></div>;
  }

  const pageTitle = isJobContext
    ? `Your application co-pilot for ${jobTitleParam} at ${companyParam}`
    : "Application co-pilot — cover letter";

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
            { href: "/dashboard/resume", label: "Resume co-pilot" },
            { href: "/dashboard/cover-letter", label: "Cover letter co-pilot", active: true },
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
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isJobContext
                    ? `Knows the exact salary, skills, and company context of this listing — not generic AI advice.`
                    : "For best results, open this from a specific job listing."}
                </p>
              </div>
              <a href={`/dashboard/resume${isJobContext ? `?jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitleParam)}&company=${encodeURIComponent(companyParam)}&salary=${encodeURIComponent(salary)}&skills=${encodeURIComponent(jobSkills)}` : ""}`}
                className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                ← Resume
              </a>
            </div>
            {isJobContext && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {[companyParam, jobTitleParam, salary].filter(Boolean).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#1D9E75]/8 px-2 py-0.5 text-xs font-medium text-[#147b5b]">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {!isJobContext && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <span className="font-semibold text-amber-800">Tip:</span>
              <span className="text-amber-700"> Open this from a job listing for a co-pilot that knows the salary, required skills, and company — automatically.</span>
              <a href="/jobs" className="ml-2 font-semibold text-[#1D9E75] hover:underline">Browse jobs →</a>
            </div>
          )}

          <div className="grid gap-8 xl:grid-cols-2">
            <form onSubmit={(e) => void handleGenerate(e)} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Job &amp; your info</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {isJobContext
                    ? `${companyParam} context and required skills are pre-filled from the listing.`
                    : "Paste the job description for the best results."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cl-name" className="mb-1.5 block text-sm font-medium text-neutral-700">Your name</label>
                  <input id="cl-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="cl-email" className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
                  <input id="cl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className={inputClass} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cl-jobtitle" className="mb-1.5 block text-sm font-medium text-neutral-700">Job title</label>
                  {isJobContext ? (
                    <div className="flex items-center rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/5 px-4 py-2.5 text-sm font-medium text-[#147b5b]">
                      {jobTitle}
                    </div>
                  ) : (
                    <input id="cl-jobtitle" type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Product Manager" className={inputClass} />
                  )}
                </div>
                <div>
                  <label htmlFor="cl-company" className="mb-1.5 block text-sm font-medium text-neutral-700">Company</label>
                  {isJobContext ? (
                    <div className="flex items-center rounded-xl border border-[#1D9E75]/30 bg-[#1D9E75]/5 px-4 py-2.5 text-sm font-medium text-[#147b5b]">
                      {company}
                    </div>
                  ) : (
                    <input id="cl-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className={inputClass} />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cl-jd" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Job description
                  {isJobContext && <span className="ml-2 text-xs font-normal text-[#1D9E75]">pre-filled from listing</span>}
                </label>
                <textarea id="cl-jd" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here for a tailored letter."
                  className={`${inputClass} min-h-[120px] resize-y`} rows={4} />
              </div>

              <div>
                <label htmlFor="cl-bg" className="mb-1.5 block text-sm font-medium text-neutral-700">Your background</label>
                <textarea id="cl-bg" value={background} onChange={(e) => setBackground(e.target.value)}
                  placeholder="Briefly describe your relevant experience and why you're excited about this role."
                  className={`${inputClass} min-h-[100px] resize-y`} rows={3} />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">Tone</p>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setTone(t.value)}
                      className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                        tone === t.value ? "border-[#1D9E75] bg-[#1D9E75]/8 text-[#188a66]" : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {genError && <p className="text-sm font-medium text-red-600">{genError}</p>}

              <button type="submit" disabled={generating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60">
                {generating ? "Generating…" : isJobContext ? `Build co-pilot letter for ${companyParam}` : "Generate cover letter"}
              </button>
            </form>

            <div className="space-y-4">
              {letter ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-neutral-900">
                      {isJobContext ? `Co-pilot letter — ${companyParam}` : "Your cover letter"}
                    </h2>
                    <div className="flex gap-2">
                      <button onClick={() => void navigator.clipboard.writeText(letter)}
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">Copy</button>
                      <button onClick={() => void handleDetect()} disabled={detecting}
                        className="rounded-lg bg-[#1D9E75]/10 px-3 py-1.5 text-xs font-semibold text-[#188a66] hover:bg-[#1D9E75]/20 disabled:opacity-60">
                        {detecting ? "Checking…" : "AI score"}
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[480px] overflow-y-auto rounded-xl bg-neutral-50 p-4 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {letter}
                  </div>

                  {detect && (
                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900">AI detection</h3>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          (detect.aiScore ?? 0) < 30 ? "bg-emerald-100 text-emerald-700"
                          : (detect.aiScore ?? 0) < 60 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                          {detect.aiScore ?? 0}% AI — {detect.verdict}
                        </span>
                      </div>
                      {detect.recommendation && <p className="text-xs font-medium text-[#188a66]">{detect.recommendation}</p>}
                    </div>
                  )}

                  {isJobContext && (
                    <div className="mt-4 rounded-xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 p-4">
                      <p className="text-xs font-semibold text-[#147b5b]">Ready to submit?</p>
                      <a href={`/apply/${jobId}`}
                        className="mt-2 inline-flex rounded-lg bg-[#1D9E75] px-4 py-2 text-xs font-semibold text-white hover:bg-[#188a66]">
                        Apply to {companyParam} →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white">
                  <div className="text-center px-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-700">
                      {isJobContext ? `Your ${companyParam} co-pilot letter will appear here` : "Cover letter will appear here"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {isJobContext ? "Tailored to the real job description and salary range" : "Fill in details and click Generate"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense>
      <CoverLetterInner />
    </Suspense>
  );
}
