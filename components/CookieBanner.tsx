"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "clearpost-cookie-consent";
const PREFS_KEY = "clearpost-cookie-preferences";

type StoredConsent = "accepted" | "dismissed" | "custom" | null;

type Prefs = {
  analytics: boolean;
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return { analytics: true };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { analytics: true };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { analytics: parsed.analytics !== false };
  } catch {
    return { analytics: true };
  }
}

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(CONSENT_KEY) as StoredConsent;
    if (consent === "accepted" || consent === "dismissed" || consent === "custom") {
      setShowBanner(false);
      setAnalyticsEnabled(readPrefs().analytics);
    } else {
      setShowBanner(true);
      setAnalyticsEnabled(readPrefs().analytics);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    localStorage.setItem(PREFS_KEY, JSON.stringify({ analytics: true }));
    setShowBanner(false);
    setPrefsOpen(false);
  }

  function dismiss() {
    localStorage.setItem(CONSENT_KEY, "dismissed");
    setShowBanner(false);
    setPrefsOpen(false);
  }

  function savePreferences() {
    localStorage.setItem(CONSENT_KEY, "custom");
    localStorage.setItem(PREFS_KEY, JSON.stringify({ analytics: analyticsEnabled }));
    setShowBanner(false);
    setPrefsOpen(false);
  }

  if (!mounted) return null;
  if (!showBanner && !prefsOpen) return null;

  return (
    <>
      {prefsOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => setPrefsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="cookie-prefs-title"
              className="text-lg font-semibold text-neutral-900"
            >
              Cookie preferences
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Choose how we use optional cookies on Clearpost.
            </p>

            <ul className="mt-6 space-y-4">
              <li className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">Essential cookies</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Required for the site to function. Always on.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    Always on
                  </span>
                </div>
              </li>
              <li className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900">Analytics cookies</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Help us understand usage so we can improve the product.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    onClick={() => setAnalyticsEnabled((v) => !v)}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                      analyticsEnabled ? "bg-[#1D9E75]" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        analyticsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </li>
            </ul>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPrefsOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="inline-flex items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#188a66]"
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showBanner ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-4 pr-12 shadow-lg sm:p-6 sm:pr-14">
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Dismiss cookie banner"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1D9E75]/10 text-[#1D9E75]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <path
                      d="M5 10c0-2.2 1.8-4 4-4h.5c.3-1.2 1.3-2 2.5-2s2.2.8 2.5 2H15c2.2 0 4 1.8 4 4v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-6z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="9" cy="13" r="1" fill="currentColor" />
                    <circle cx="13" cy="11" r="0.9" fill="currentColor" />
                    <circle cx="15" cy="15" r="0.9" fill="currentColor" />
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-neutral-900">We use cookies</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                    We use cookies to improve your experience. We never sell your data.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:shrink-0">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#188a66]"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsEnabled(readPrefs().analytics);
                    setPrefsOpen(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-[#1D9E75]/50 bg-white px-5 py-2.5 text-sm font-semibold text-[#1D9E75] hover:bg-[#1D9E75]/5"
                >
                  Manage preferences
                </button>
                <a
                  href="#"
                  className="text-center text-sm font-semibold text-[#1D9E75] hover:text-[#188a66] sm:text-left"
                >
                  Privacy policy
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
