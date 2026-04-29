import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getSubscriptionTier, canUseAI } from "@/lib/subscription";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`salary-coach:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again in an hour." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
  }

  // Auth check — salary coach is Pro only
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  let userId: string | null = null;

  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey);
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
  }

  if (userId) {
    const tier = await getSubscriptionTier(userId);
    if (!canUseAI(tier)) {
      return NextResponse.json(
        { error: "Salary coach is a Pro feature. Upgrade at /pricing." },
        { status: 403 },
      );
    }
  }

  const body = (await request.json()) as {
    role?: string;
    company?: string;
    currentOffer?: string;
    location?: string;
    yearsExp?: string;
    competing?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryRange?: string;
  };

  const role = sanitizeText(body.role, 100);
  const company = sanitizeText(body.company, 100);
  const currentOffer = sanitizeText(body.currentOffer, 100);
  const location = sanitizeText(body.location, 100);
  const yearsExp = sanitizeText(body.yearsExp, 50);
  const competing = sanitizeText(body.competing, 500);
  const salaryRange = sanitizeText(body.salaryRange, 100);
  const salaryMin = Number(body.salaryMin ?? 0);
  const salaryMax = Number(body.salaryMax ?? 0);

  const salaryContext = salaryMin > 0 && salaryMax > 0
    ? `The verified salary range from the Clearpost listing is ${salaryRange} ($${Math.round(salaryMin / 1000)}k–$${Math.round(salaryMax / 1000)}k). This is employer-posted verified data, not an estimate.`
    : `The stated offer is: ${currentOffer || "not specified"}.`;

  const prompt = `You are an expert salary negotiation coach with deep knowledge of tech industry compensation benchmarks.

Role: ${role || "Software Engineer"}
Company: ${company || "the company"}
Salary data: ${salaryContext}
Location: ${location || "US"}
Years of experience: ${yearsExp || "not specified"}
Competing offers or leverage: ${competing || "none mentioned"}

Write a practical, specific salary negotiation playbook. Structure it as:

**1. Opening message to send (email/Slack)**
Write the actual message — 2-3 sentences, polite but confident, states the counter number.

**2. The counter-offer number**
State the specific number or range to ask for, and the reasoning based on the salary data.

**3. What to say on the call**
A word-for-word script for the negotiation call if they want to discuss live.

**4. If they say the range is firm**
Exactly what to say — how to reframe, how to ask about non-salary compensation.

**5. Alternative levers if salary is capped**
Three specific asks: signing bonus amount, equity, PTO days, or remote flexibility. Be specific.

Be direct and concrete. No filler phrases like "great opportunity." Use the verified salary data as anchor.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.65,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI generation failed." }, { status: 502 });
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const script = data.choices[0]?.message?.content ?? "";
  return NextResponse.json({ script });
}
