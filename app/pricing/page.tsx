"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type PlanId = "pro" | "student-pro" | "employer-featured" | "employer-unlimited";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  priceId: string;
};

const PRICE_IDS = {
  pro: "price_1TQbsH48dhA06sxFnRlOrQOf",
  student_pro: "price_1TQcSZ48dhA06sxFXCslQB7v",
  employer_featured: "price_1TQcE248dhA06sxFC115wsei",
  employer_unlimited: "price_1TQcGC48dhA06sxFUwuRvQSo",
} as const;

const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    description: "For professionals who want premium job tools.",
    features: [
      "Unlimited applications",
      "AI resume builder",
      "AI cover letter builder",
      "AI match scores",
      "10 builds/month",
    ],
    priceId: PRICE_IDS.pro,
  },
  {
    id: "student-pro",
    name: "Student Pro",
    price: "$5",
    description: "For students who want enhanced internship visibility.",
    features: [
      "Internship applications",
      "Confidence scores",
      "AI resume builder",
      "AI cover letter builder",
      "5 builds/month",
    ],
    priceId: PRICE_IDS.student_pro,
  },
  {
    id: "employer-featured",
    name: "Employer Featured",
    price: "$149",
    description: "Boost one job listing for better visibility.",
    features: [
      "Single job listing boost",
      "Priority placement",
      "48hr ghost job removal",
    ],
    priceId: PRICE_IDS.employer_featured,
  },
  {
    id: "employer-unlimited",
    name: "Employer Unlimited",
    price: "$349",
    description: "Unlimited featured posting access for employers.",
    features: [
      "Unlimited job postings",
      "AI applicant ranking",
      "Ghost job removal every 48hrs",
      "Founding employer rate",
    ],
    popular: true,
    priceId: PRICE_IDS.employer_unlimited,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: PlanId, priceId: string) {
    setError(null);
    console.log("[checkout] start", { planId, hasPriceId: Boolean(priceId) });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("[checkout] blocked: user not signed in");
      setError("Please sign in before starting checkout.");
      return;
    }
    console.log("[checkout] user resolved", { userId: user.id, planId, priceId });

    setLoadingPlan(planId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      console.log("[checkout] response status", response.status);
      let data: { url?: string; error?: string } = {};
      try {
        data = (await response.json()) as { url?: string; error?: string };
      } catch {
        console.error("[checkout] non-JSON response from /api/checkout");
        throw new Error("Invalid response from checkout API.");
      }
      console.log("[checkout] response body", data);

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }

      if (!data.url) {
        throw new Error("Checkout URL not returned.");
      }

      console.log("[checkout] redirecting to Stripe checkout", data.url);
      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("[checkout] failed", err);
      setError(message);
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-900">
            Simple, transparent pricing
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the plan that fits your hiring goals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-900 sm:text-lg">
            Select a plan below and continue to secure Stripe checkout in seconds.
          </p>
        </div>

        {error ? (
          <p
            className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100 backdrop-blur"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.id;
            return (
              <article
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl border bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl ${
                  plan.popular ? "border-[#22c58b]/60" : "border-white/20"
                }`}
              >
                {plan.popular ? (
                  <span className="absolute right-4 top-4 rounded-full bg-[#1D9E75] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                ) : null}

                <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-5xl font-extrabold tracking-tight text-gray-900">
                  {plan.price}
                  <span className="ml-1 text-base font-medium text-gray-600">/mo</span>
                </p>
                <p className="mt-3 text-sm text-gray-600">{plan.description}</p>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center text-[#1D9E75]">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
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
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => void handleCheckout(plan.id, plan.priceId)}
                  disabled={loadingPlan !== null}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1D9E75] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1D9E75]/30 transition-all hover:-translate-y-0.5 hover:bg-[#188a66] hover:shadow-[#1D9E75]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6de0b8] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? "Redirecting..." : `Choose ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

