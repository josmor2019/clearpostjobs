"use client";

import { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [showCodeStep, setShowCodeStep] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  useEffect(() => {
    if (!showCodeStep || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showCodeStep, secondsLeft]);

  function formatCountdown(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleDigitChange(index: number, value: string) {
    const onlyDigit = value.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = onlyDigit;
      return next;
    });
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
                We&apos;ll get you back in
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/90 sm:text-lg">
                Password recovery is quick and easy
              </p>

              <ul className="mt-10 space-y-4">
                {[
                  "Reset via email or phone",
                  "6-digit code expires in 5 minutes",
                  "Your account stays secure",
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
          <main className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Choose how you want to reset your password
              </p>
            </div>

            <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("email");
                    setShowCodeStep(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "email"
                      ? "bg-white text-[#1D9E75] shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("phone")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    activeTab === "phone"
                      ? "bg-white text-[#1D9E75] shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Phone
                </button>
              </div>
            </div>

            {activeTab === "email" ? (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-neutral-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
                >
                  Send reset link
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowCodeStep(true);
                    setSecondsLeft(5 * 60);
                    setDigits(["", "", "", "", "", ""]);
                  }}
                >
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-medium text-neutral-700"
                    >
                      Phone number
                    </label>
                    <div className="flex rounded-xl border border-neutral-200 bg-white focus-within:border-[#1D9E75] focus-within:ring-2 focus-within:ring-[#1D9E75]/25">
                      <span className="inline-flex items-center border-r border-neutral-200 px-3 text-sm font-medium text-neutral-600">
                        +1
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(555) 123-4567"
                        className="w-full rounded-r-xl border-0 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
                  >
                    Send 6-digit code
                  </button>
                </form>

                {showCodeStep ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                    <p className="text-sm font-medium text-neutral-700">
                      Enter verification code
                    </p>
                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {digits.map((digit, index) => (
                        <input
                          key={index}
                          value={digit}
                          onChange={(e) =>
                            handleDigitChange(index, e.target.value)
                          }
                          inputMode="numeric"
                          maxLength={1}
                          className="h-11 w-full rounded-lg border border-neutral-200 bg-white text-center text-base font-semibold text-neutral-900 outline-none transition-shadow focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25"
                          aria-label={`Code digit ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75]"
                    >
                      Verify code
                    </button>
                    <div className="mt-3 text-center text-xs">
                      <button
                        type="button"
                        onClick={() => setSecondsLeft(5 * 60)}
                        className="font-semibold text-[#1D9E75] hover:text-[#188a66] disabled:cursor-not-allowed disabled:text-neutral-400"
                        disabled={secondsLeft > 0}
                      >
                        Resend code
                      </button>
                      <span className="ml-2 text-neutral-500">
                        {secondsLeft > 0
                          ? `in ${formatCountdown(secondsLeft)}`
                          : "now available"}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <p className="mt-5 text-center text-sm">
              <a
                href="/sign-in"
                className="font-semibold text-[#1D9E75] transition-colors hover:text-[#188a66]"
              >
                Back to sign in
              </a>
            </p>

            <p className="mt-6 text-center text-xs leading-relaxed text-neutral-500">
              Didn&apos;t receive it? Check your spam folder or try again
            </p>
          </main>
        </section>
      </div>
    </div>
  );
}

