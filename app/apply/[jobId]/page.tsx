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
  const [resumeLinkInput, setResumeLinkInput] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [jobTitle, setJobTitle] = useState("this role");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace(`/sign-in?redirect=/apply/${jobId}`);
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
            const saved = String(data.resume_url ?? "");
            if (saved) {
              setResumeUrl(saved);
              // If it's a storage URL, show it as previously uploaded
              if (saved.includes("/storage/v1/object/public/")) {
                setUploadedFileName("Saved resume");
              } else {
                setResumeLinkInput(saved);
              }
            }
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

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/sign-in?redirect=/apply/${jobId}`);
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: fd,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || data.error) {
        setUploadError(data.error ?? "Upload failed. Please try again.");
      } else {
        setResumeUrl(data.url ?? "");
        setUploadedFileName(file.name);
        setResumeLinkInput("");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleLinkChange(val: string) {
    setResumeLinkInput(val);
    setResumeUrl(val);
    setUploadedFileName(null);
    setUploadError(null);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        router.replace(`/sign-in?redirect=/apply/${jobId}`);
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
        <a href="/dashboard" className="mt-6 inline-flex rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]">
          Back to dashboard
        </a>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

  const resumeDisplay = uploadedFileName
    ? `Uploaded: ${uploadedFileName}`
    : resumeUrl
    ? "Link provided"
    : "Not provided";

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased">
      <header className="border-b border-neutral-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
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
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s < step ? "bg-[#1D9E75] text-white" : s === step ? "border-2 border-[#1D9E75] text-[#1D9E75]" : "border-2 border-neutral-200 text-neutral-400"}`}>
                  {s < step ? (
                    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden>
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s}
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Alex Morgan" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
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
              <p className="mt-1 text-sm text-neutral-600">Upload a PDF or paste a link.</p>
            </div>

            {/* File upload zone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Upload PDF</label>
              <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${uploadedFileName ? "border-[#1D9E75] bg-[#1D9E75]/5" : "border-neutral-200 hover:border-[#1D9E75]/50"}`}>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => void handleFileUpload(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                />
                {uploading ? (
                  <p className="text-sm text-neutral-600">Uploading…</p>
                ) : uploadedFileName ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#1D9E75]" aria-hidden>
                      <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm font-medium text-[#1D9E75]">{uploadedFileName}</p>
                    <p className="text-xs text-neutral-500">Click to replace</p>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-neutral-400" aria-hidden>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm text-neutral-600">Click to upload PDF</p>
                    <p className="text-xs text-neutral-400">Max 5 MB</p>
                  </>
                )}
              </label>
              {uploadError && <p className="mt-1.5 text-xs font-medium text-red-600">{uploadError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">or paste a link</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Resume URL</label>
              <input
                type="url"
                value={resumeLinkInput}
                onChange={(e) => handleLinkChange(e.target.value)}
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
                placeholder="A brief note about why you're a great fit..."
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={uploading}
                className="flex-1 rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66] disabled:opacity-60"
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
                <span className={`font-medium ${resumeUrl ? "text-[#188a66]" : "text-neutral-400"}`}>
                  {resumeDisplay}
                </span>
              </div>
              {coverNote && (
                <div>
                  <span className="text-neutral-500">Cover note</span>
                  <p className="mt-1 text-neutral-900 line-clamp-3">{coverNote}</p>
                </div>
              )}
            </div>

            {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
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
