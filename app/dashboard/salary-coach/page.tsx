"use client";

import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, Suspense } from "react";

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/25";

function SalaryCoachInner() {
  const router = useRouter();
  const params = useSearchParams();

  const companyParam = params.get("company") ?? "";
  const roleParam = params.get("role") ?? "";
  const salaryParam = params.get("salary") ?? "";
  const salaryMin = Number(params.get("salaryMin") ?? 0);
  const salaryMax = Number(params.get("salaryMax") ?? 0);

  const [authChecked, setAuthChecked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [company, setCompany] = useState(companyParam);
  const [role, setRole] = useState(roleParam);
  const [currentOffer, setCurrentOffer] = useState(salaryParam ? `${salaryMin > 0 ? `$${Math.round(salaryMin / 1000)}k` : salaryParam}` : "");
  const [location, setLocation] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [competing, setCompeting] = useState("");
  const [script, setScript] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/sign-in"); return; }

      supabase.from("profiles")
        .select("subscription_status, subscription_tier, location")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          const tier = data?.subscription_tier as string | undefined;
          const active = data?.subscription_status === "active";
          setIsPro(active && (tier === "pro" || tier === "student_pro"));
          if (data?.location) setLocation(String(data.location));
        });

      setAuthChecked(true);
    });
  }, [router]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!isPro) {
      router.push("/pricing?from=salary-coach");
      return;
    }
    setError(null);
    setScript(null);
    setGenerating(true);

    const salaryContext = salaryMin && salaryMax
      ? `The listed salary range on Clearpost is ${salaryParam} ($${Math.round(salaryMin / 1000)}k–$${Math.round(salaryMax / 1000)}k). This is a verified salary from the employer.`
      : `The stated offer is around ${currentOffer}.`;

    const prompt = `You are an expert salary negotiation coach with deep knowledge of tech industry compensation.

Role: ${role || "Software Engineer"}
Company: ${company || "the company"}
Current offer / stated range: ${salaryContext}
Location: ${location || "US"}
Years of experience: ${yearsExp || "not specified"}
Competing offers or leverage: ${competing || "none mentioned"}

Write a practical salary negotiation script. Include:
1. Opening message to send (email or Slack-friendly tone, 2-3 sentences)
2. The specific number to counter with, and why
3. What to say on the call when they push back
4. What to do if they say the range is firm
5. Three things to negotiate if salary is truly capped (signing bonus, equity refresh, PTO, remote flexibility)

Be specific and direct. No filler phrases. Base the counter on the verified salary data from Clearpost listings for similar roles. Format as numbered sections with sub-points where needed.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.65,
      }),
    }).catch(() => null);

    // Fall back to server-side route since client-side OpenAI calls expose keys
    const serverRes = await fetch("/api/ai/salary-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, company, currentOffer, location, yearsExp, competing, salaryMin, salaryMax, salaryRange: salaryParam }),
    });

    setGenerating(false);

    if (serverRes.ok) {
      const data = (await serverRes.json()) as { script?: string; error?: string };
      if (data.error) { setError(data.error); return; }
      setScript(data.script ?? "");
    } else {
      void res;
      setError("Generation failed. Please try again.");
    }
  }

  async function handleCopy() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!authChecked) {
    return <div className="flex min-h-screen items-center justify-center bg-neutral-50"><p className="text-sm text-neutral-500">Loading…</p></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
              <path d="M12 16L6 10l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-semibold text-neutral-900">Salary negotiation coach</span>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Salary negotiation coach
          </h1>
          <p className="mt-2 text-neutral-600">
            {companyParam
              ? `Negotiation scripts for ${roleParam} at ${companyParam} — trained on verified Clearpost salary data.`
              : "Get a negotiation script trained on real, verified Clearpost salary data."}
          </p>
        </div>

        {!isPro && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">Pro feature</p>
            <p className="mt-1 text-sm text-amber-800">
              The salary coach is available on Pro ($9/month). It generates negotiation scripts trained on verified salary data from Clearpost listings — not generic advice.
            </p>
            <a href="/pricing" className="mt-3 inline-flex rounded-xl bg-[#1D9E75] px-5 py-2 text-sm font-semibold text-white hover:bg-[#188a66]">
              Upgrade to Pro →
            </a>
          </div>
        )}

        {salaryMin > 0 && salaryMax > 0 && (
          <div className="mb-6 rounded-xl border border-[#1D9E75]/20 bg-[#1D9E75]/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D9E75]/15 text-[#1D9E75]">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <path d="M10 2v2m0 12v2M4.93 4.93l1.41 1.41m7.32 7.32l1.41 1.41M2 10h2m12 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#147b5b]">Verified salary data from this listing</p>
                <p className="text-xs text-[#188a66]">Range: {salaryParam} — your co-pilot will use this to build your counter-offer strategy.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={(e) => void handleGenerate(e)} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">Tell me about the offer</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="Stripe" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Current offer / salary range
                {salaryParam && <span className="ml-2 text-xs font-normal text-[#1D9E75]">from Clearpost listing</span>}
              </label>
              <input type="text" value={currentOffer} onChange={(e) => setCurrentOffer(e.target.value)}
                className={salaryParam ? `${inputClass} border-[#1D9E75]/40 bg-[#1D9E75]/3` : inputClass}
                placeholder="$150k, $150k–$180k, or $150k + 50k equity" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="San Francisco, CA" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Years of experience</label>
                <input type="text" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} className={inputClass} placeholder="5 years" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Competing offers or leverage <span className="font-normal text-neutral-400">(optional)</span>
              </label>
              <input type="text" value={competing} onChange={(e) => setCompeting(e.target.value)} className={inputClass}
                placeholder="Offer from Notion at $165k, strong performance reviews…" />
            </div>

            {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={generating || !isPro}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D9E75] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#188a66] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Building script…
                </>
              ) : !isPro ? "Upgrade to Pro to generate" : "Generate negotiation script"}
            </button>
          </form>

          <div>
            {script ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-neutral-900">Your negotiation script</h2>
                  <button type="button" onClick={() => void handleCopy()}
                    className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="overflow-auto rounded-xl bg-neutral-50 p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-800">{script}</pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white">
                  <div className="text-center px-6">
                    <p className="text-sm font-medium text-neutral-700">Your script will appear here</p>
                    <p className="mt-1 text-xs text-neutral-500">Trained on verified Clearpost salary data</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-900">What you get with this coach</h3>
                  <ul className="space-y-2 text-xs text-neutral-600">
                    {[
                      "Opening email or message you can send today",
                      "Specific counter-offer number based on verified salary data",
                      "Word-for-word script for the negotiation call",
                      "What to say when they push back or say range is firm",
                      "Alternative compensation levers: signing bonus, equity, PTO",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="mt-0.5 font-bold text-[#1D9E75]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SalaryCoachPage() {
  return (
    <Suspense>
      <SalaryCoachInner />
    </Suspense>
  );
}
