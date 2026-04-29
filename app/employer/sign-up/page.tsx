"use client";

import { supabase } from "@/lib/supabase";
import { useState, type FormEvent } from "react";
import { extractEmailDomain, domainMatchesCompany } from "@/lib/listing-scanner";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;

export default function EmployerSignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companySize, setCompanySize] = useState<string>("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [domainWarning, setDomainWarning] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Domain verification check: warn if email domain doesn't match company name
    const emailDomain = extractEmailDomain(email);
    const FREE_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
    const domainVerified =
      !FREE_DOMAINS.includes(emailDomain) &&
      domainMatchesCompany(emailDomain, companyName);

    if (!domainVerified) {
      if (FREE_DOMAINS.includes(emailDomain)) {
        setDomainWarning(
          "You are signing up with a personal email address. Your listings will be held for manual verification before going live. For instant approval, use your company email (e.g. you@company.com).",
        );
      } else {
        setDomainWarning(
          `Your email domain (${emailDomain}) does not appear to match "${companyName}". Your listings will require manual verification before going live.`,
        );
      }
    } else {
      setDomainWarning(null);
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: "employer",
          company_name: companyName,
          company_size: companySize,
          industry,
          domain_verified: domainVerified,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
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
                Create your employer account
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Post jobs and reach verified candidates
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="company-name"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Company name
                </label>
                <input
                  id="company-name"
                  name="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
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

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="company-size"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Company size
                </label>
                <select
                  id="company-size"
                  name="companySize"
                  required
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                >
                  <option value="" disabled>
                    Select company size
                  </option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Industry
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  required
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology, Healthcare"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create employer account"}
              </button>
            </form>

            {domainWarning && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">Verification required</p>
                <p className="mt-0.5 text-xs text-amber-700">{domainWarning}</p>
              </div>
            )}
            {success ? (
              <p className="mt-4 text-center text-sm font-medium text-[#188a66]">
                Check your email to confirm your account
              </p>
            ) : null}
            {error ? (
              <p
                className="mt-4 text-center text-sm font-medium text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <a
                href="/employer/sign-in"
                className="font-semibold text-[#1D9E75] transition-colors hover:text-[#188a66]"
              >
                Sign in
              </a>
            </p>
          </main>
        </section>
      </div>
    </div>
  );
}

