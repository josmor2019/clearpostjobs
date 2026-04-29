"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Tab = "profile" | "account" | "notifications";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/sign-in"); return; }
      setUserId(user.id);
      setCurrentEmail(user.email ?? "");
      supabase
        .from("profiles")
        .select("full_name, job_title, location, skills, bio, resume_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFullName(String(data.full_name ?? ""));
            setJobTitle(String(data.job_title ?? ""));
            setLocation(String(data.location ?? ""));
            setSkills(String(data.skills ?? ""));
            setBio(String(data.bio ?? ""));
            setResumeUrl(String(data.resume_url ?? ""));
          }
        });
    });
  }, [router]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        job_title: jobTitle,
        location,
        skills,
        bio,
        resume_url: resumeUrl,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    setSaveMsg(error ? { type: "error", text: error.message } : { type: "success", text: "Profile saved." });
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSaveMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setSaveMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      setSaveMsg({ type: "error", text: error.message });
    } else {
      setNewPassword("");
      setConfirmPassword("");
      setSaveMsg({ type: "success", text: "Password updated." });
    }
    setTimeout(() => setSaveMsg(null), 3000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-semibold text-neutral-900">Settings</span>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Account settings</h1>

        <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-[#1D9E75] text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {saveMsg && (
          <div
            className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
              saveMsg.type === "success"
                ? "border-[#1D9E75]/30 bg-[#1D9E75]/5 text-[#147b5b]"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
            role="alert"
          >
            {saveMsg.text}
          </div>
        )}

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900">Public profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Alex Morgan" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Job title</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputCls} placeholder="Software Engineer" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Skills</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className={inputCls} placeholder="React, TypeScript, Node.js, Python" />
              <p className="mt-1 text-xs text-neutral-400">Used to compute match scores on job listings.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Bio</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputCls} resize-none`} placeholder="Brief professional summary..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Resume URL</label>
              <input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className={inputCls} placeholder="https://drive.google.com/your-resume" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        )}

        {tab === "account" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-neutral-900">Email address</h2>
              <p className="mb-4 text-sm text-neutral-600">Your current email: <strong>{currentEmail}</strong></p>
              <p className="text-xs text-neutral-400">To change your email, contact support.</p>
            </div>

            <form onSubmit={savePassword} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-neutral-900">Change password</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">New password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder="At least 8 characters" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} placeholder="Repeat new password" />
              </div>
              <button
                type="submit"
                disabled={saving || !newPassword}
                className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Update password"}
              </button>
            </form>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-base font-semibold text-neutral-900">Sign out</h2>
              <p className="mb-4 text-sm text-neutral-600">You will be signed out of all devices.</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900">Email notifications</h2>
            {[
              { label: "Email notifications", description: "Receive email updates about your account", value: emailNotifs, set: setEmailNotifs },
              { label: "Application updates", description: "Get notified when your application status changes", value: applicationUpdates, set: setApplicationUpdates },
              { label: "New job alerts", description: "Weekly digest of new jobs matching your skills", value: jobAlerts, set: setJobAlerts },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                  <p className="text-xs text-neutral-500">{item.description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.value}
                  onClick={() => item.set((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    item.value ? "bg-[#1D9E75]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                      item.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
            >
              Save preferences
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
