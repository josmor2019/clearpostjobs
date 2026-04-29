"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function EmployerSignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/employer/dashboard` },
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/employer/dashboard");
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative overflow-hidden bg-[#1D9E75] px-6 py-10 text-white sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#188a66]/60 blur-3xl" />
            <div className="absolute right-10 top-1/3 h-64 w-64 rounded-full bg-[#188a66]/40 blur-3xl" />
            <div className="absolute -bottom-16 left-1/3 h-80 w-80 rounded-full bg-[#147b5b]/45 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col">
            <a href="/" className="inline-flex items-center gap-3 self-start">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl font-bold text-white backdrop-blur-sm">
                C
              </span>
              <span className="text-3xl font-semibold tracking-tight">Clearpost</span>
            </a>

            <div className="mt-16 lg:mt-24">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                Find your next role faster
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/90 sm:text-lg">
                Join thousands of professionals finding verified jobs with real
                salaries
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  "Apply to verified jobs only",
                  "See salary before you apply",
                  "One-click apply with your profile",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        aria-hidden
                      >
                        <path
                          d="M5 10.5L8.2 13.5L15 6.8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white/95 sm:text-base">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:px-12">
          <main className="w-full max-w-xl">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Employer sign in
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Sign in to manage jobs and candidates
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="work-email"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Work email
                </label>
                <input
                  id="work-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-16 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 my-auto inline-flex h-8 items-center rounded-lg px-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {error ? (
              <p
                className="mt-4 text-center text-sm font-medium text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                or sign in with
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600"
                aria-hidden
              >
                G
              </span>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <a
                href="/employer/sign-up"
                className="font-semibold text-[#1D9E75] transition-colors hover:text-[#188a66]"
              >
                Sign up
              </a>
            </p>
          </main>
        </section>
      </div>
    </div>
  );
}

