"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Tab = "company" | "account";

export default function EmployerSettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("company");

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  const [currentEmail, setCurrentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/employer/sign-in"); return; }
      setUserId(user.id);
      setCurrentEmail(user.email ?? "");
      const meta = user.user_metadata as Record<string, unknown> | undefined;
      if (meta?.company_name) setCompanyName(String(meta.company_name));

      supabase
        .from("profiles")
        .select("company_name, company_website, company_size, industry, company_bio")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            if (data.company_name) setCompanyName(String(data.company_name));
            setCompanyWebsite(String(data.company_website ?? ""));
            setCompanySize(String(data.company_size ?? ""));
            setIndustry(String(data.industry ?? ""));
            setCompanyBio(String(data.company_bio ?? ""));
          }
        });
    });
  }, [router]);

  async function saveCompany(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      company_name: companyName,
      company_website: companyWebsite,
      company_size: companySize,
      industry,
      company_bio: companyBio,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaveMsg(error ? { type: "error", text: error.message } : { type: "success", text: "Company profile saved." });
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
    router.replace("/employer/sign-in");
  }

  const inputCls =
    "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a href="/employer/dashboard" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
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
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Employer settings</h1>

        <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1 mb-6 w-fit">
          {(["company", "account"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-[#1D9E75] text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {t}
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

        {tab === "company" && (
          <form onSubmit={saveCompany} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-neutral-900">Company profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Company name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} placeholder="Acme Inc." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Website</label>
                <input type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className={inputCls} placeholder="https://acme.com" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Company size</label>
                <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={inputCls}>
                  <option value="">Select size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-1000">201–1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Industry</label>
                <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} placeholder="Technology, Finance, Healthcare…" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">About the company</label>
              <textarea rows={4} value={companyBio} onChange={(e) => setCompanyBio(e.target.value)} className={`${inputCls} resize-none`} placeholder="Brief description of what your company does..." />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save company profile"}
            </button>
          </form>
        )}

        {tab === "account" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-neutral-900">Email address</h2>
              <p className="mb-4 text-sm text-neutral-600">Signed in as: <strong>{currentEmail}</strong></p>
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
              <button type="submit" disabled={saving || !newPassword} className="rounded-xl bg-[#1D9E75] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66] disabled:opacity-60">
                {saving ? "Saving…" : "Update password"}
              </button>
            </form>

            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-base font-semibold text-neutral-900">Sign out</h2>
              <button type="button" onClick={handleSignOut} className="rounded-xl border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                Sign out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
