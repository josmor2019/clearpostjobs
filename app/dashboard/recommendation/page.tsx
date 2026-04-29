"use client";

import { useState, type FormEvent } from "react";

type Tone = "formal" | "warm" | "enthusiastic";

export default function RecommendationPage() {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [professorName, setProfessorName] = useState("");
  const [course, setCourse] = useState("");
  const [relationship, setRelationship] = useState("");
  const [achievements, setAchievements] = useState("");
  const [targetProgram, setTargetProgram] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentEmail,
          professorName,
          course,
          relationship,
          achievements,
          targetProgram,
          tone,
        }),
      });
      const data = (await res.json()) as { letter?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Generation failed.");
      } else {
        setLetter(data.letter ?? "");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-semibold text-neutral-900">Recommendation Letter Generator</span>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Professor Recommendation Letter
          </h1>
          <p className="mt-2 text-neutral-600">
            Generate a personalized recommendation letter to share with your professor as a draft.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-neutral-900">Letter details</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Alex Morgan"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Your email
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Professor&apos;s name
                  </label>
                  <input
                    type="text"
                    value={professorName}
                    onChange={(e) => setProfessorName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Course / subject
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Advanced Algorithms, CS 401"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Target program / opportunity
                </label>
                <input
                  type="text"
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  placeholder="Google SWE Internship / Stanford MS CS"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  How the professor knows you
                </label>
                <textarea
                  rows={2}
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="I took their course for 2 semesters and served as a TA..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Key achievements & qualities to highlight
                </label>
                <textarea
                  rows={4}
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Top of class on final project, presented research at department symposium, exceptional analytical thinking..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Tone
                </label>
                <div className="flex gap-2">
                  {(["formal", "warm", "enthusiastic"] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                        tone === t
                          ? "border-[#1D9E75] bg-[#1D9E75]/8 text-[#1D9E75]"
                          : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating…
                  </>
                ) : (
                  "Generate letter"
                )}
              </button>

              {error && (
                <p className="text-center text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              )}
            </form>
          </section>

          <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">Generated letter</h2>
              {letter && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            {letter ? (
              <div className="flex-1 overflow-auto rounded-xl bg-neutral-50 p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-800">
                  {letter}
                </pre>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-neutral-400" aria-hidden>
                    <path d="M9 12h6M9 16h6M7 8h10M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-500">Your letter will appear here</p>
                <p className="mt-1 text-xs text-neutral-400">Fill in the details and click Generate</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
