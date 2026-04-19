"use client";

import { useState } from "react";

export default function EmployerSignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

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
                Start hiring verified candidates
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/90 sm:text-lg">
                Post jobs that reach thousands of verified professionals
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  "Post your first job in minutes",
                  "Only pay for results",
                  "Reach pre-verified candidates",
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
                Start posting verified jobs today
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    First name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    placeholder="Alex"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Last name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    placeholder="Morgan"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>
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
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

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
                  placeholder="Clearpost Inc."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

              <div>
                <label
                  htmlFor="company-website"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Company website
                </label>
                <input
                  id="company-website"
                  name="companyWebsite"
                  type="url"
                  placeholder="https://company.com"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="industry"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select industry
                    </option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
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
                    className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-800 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select size
                    </option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-1000">201-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
              >
                Create employer account
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                or sign up with
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
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
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white"
                  aria-hidden
                >
                  A
                </span>
                Continue with Apple
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600"
                  aria-hidden
                >
                  M
                </span>
                Continue with Microsoft
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700"
                  aria-hidden
                >
                  in
                </span>
                Continue with LinkedIn
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="font-semibold text-[#1D9E75] transition-colors hover:text-[#188a66]"
              >
                Sign in
              </a>
            </p>

            <p className="mt-5 text-center text-xs leading-relaxed text-neutral-500">
              By creating an account, you agree to Clearpost&apos;s Terms of Service
              and Privacy Policy.
            </p>
          </main>
        </section>
      </div>
    </div>
  );
}

