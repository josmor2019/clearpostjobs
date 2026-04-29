"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setDone(true);
      setTimeout(() => router.replace("/dashboard"), 2500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
                <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Password updated!</h1>
            <p className="mt-2 text-sm text-neutral-600">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">Set new password</h1>
              <p className="mt-2 text-sm text-neutral-600">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-16 text-sm text-neutral-900 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 my-auto inline-flex h-8 items-center rounded-lg px-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>
              {error && (
                <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
