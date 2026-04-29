"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";

type Step = 1 | 2 | 3;

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [jobTitle, setJobTitle] = useState("this role");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(`/sign-in?next=/apply/${jobId}`);
        return;
      }
      setEmail(user.email ?? "");
      supabase
        .from("profiles")
        .select("full_name, resume_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setName(String(data.full_name ?? ""));
            setResumeUrl(String(data.resume_url ?? ""));
          }
        });
    });

    supabase
      .from("jobs")
      .select("title")
      .eq("id", jobId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.title) setJobTitle(String(data.title));
      });
  }, [jobId, router]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        router.replace(`/sign-in?next=/apply/${jobId}`);
        return;
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, coverNote, resumeUrl }),
      });

      const data = (await res.json()) as { applicationId?: string; error?: string };
      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to submit.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
            <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Application submitted!</h1>
        <p className="mt-2 text-sm text-neutral-600">We&apos;ve sent your application for <strong>{jobTitle}</strong>.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
        >
          Back to dashboard
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased">
      <header className="border-b border-neutral-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Cancel
          </button>
          <span className="text-sm font-semibold text-neutral-900">Apply — {jobTitle}</span>
          <div className="w-12" />
        </div>
      </header>

      <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    s < step
                      ? "bg-[#1D9E75] text-white"
                      : s === step
                        ? "border-2 border-[#1D9E75] text-[#1D9E75]"
                        : "border-2 border-neutral-200 text-neutral-400"
                  }`}
                >
                  {s < step ? (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden>
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className={`text-xs font-medium ${s === step ? "text-neutral-900" : "text-neutral-400"}`}>
                  {s === 1 ? "Confirm info" : s === 2 ? "Resume" : "Review & submit"}
                </span>
                {s < 3 && <div className="h-px flex-1 bg-neutral-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Confirm your info</h2>
              <p className="mt-1 text-sm text-neutral-600">Make sure your details are up to date.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Alex Morgan"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!name.trim() || !email.trim()}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Attach your resume</h2>
              <p className="mt-1 text-sm text-neutral-600">Provide a link to your resume (Google Drive, Dropbox, etc.)</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Resume URL</label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className={inputCls}
                placeholder="https://drive.google.com/your-resume"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Cover note <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="A brief note about why you&apos;re a great fit..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66]"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Review &amp; submit</h2>
              <p className="mt-1 text-sm text-neutral-600">Double-check your application before sending.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Applying for</span>
                <span className="font-medium text-neutral-900">{jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Name</span>
                <span className="font-medium text-neutral-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Email</span>
                <span className="font-medium text-neutral-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Resume</span>
                <span className="font-medium text-neutral-900">{resumeUrl ? "Attached" : "Not provided"}</span>
              </div>
              {coverNote && (
                <div>
                  <span className="text-neutral-500">Cover note</span>
                  <p className="mt-1 text-neutral-900 line-clamp-3">{coverNote}</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
