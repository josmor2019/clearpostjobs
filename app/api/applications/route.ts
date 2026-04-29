// SQL migration needed:
//   CREATE TABLE IF NOT EXISTS flagged_accounts (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id uuid REFERENCES auth.users NOT NULL,
//     reason text NOT NULL,
//     flagged_at timestamptz DEFAULT now(),
//     resolved_at timestamptz,
//     paused_until timestamptz
//   );

import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(url, serviceKey);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`apply:${user.id}:${ip}`, 20, 24 * 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Application limit reached for today." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  // Bot detection: more than 10 applications in the last hour → flag account
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("applied_at", oneHourAgo);

  if ((recentCount ?? 0) >= 10) {
    // Flag the account for admin review
    await supabase.from("flagged_accounts").insert({
      user_id: user.id,
      reason: `Submitted ${(recentCount ?? 0) + 1} applications within 1 hour (bot detection threshold)`,
      paused_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json(
      {
        error:
          "Unusual activity detected. Your account has been temporarily paused and flagged for review. Contact support if this was a mistake.",
      },
      { status: 429 },
    );
  }

  // Check if account is currently paused from a prior bot flag
  const { data: flag } = await supabase
    .from("flagged_accounts")
    .select("paused_until")
    .eq("user_id", user.id)
    .is("resolved_at", null)
    .gt("paused_until", new Date().toISOString())
    .maybeSingle();

  if (flag) {
    return NextResponse.json(
      { error: "Your account is temporarily paused. Contact support for help." },
      { status: 403 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_tier")
    .eq("id", user.id)
    .maybeSingle();

  const isFreeTier =
    !profile || profile.subscription_status !== "active";

  if (isFreeTier) {
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Free accounts are limited to 3 applications. Upgrade to Pro for unlimited." },
        { status: 403 },
      );
    }
  }

  const body = (await request.json()) as {
    jobId?: string;
    coverNote?: string;
    resumeUrl?: string;
  };

  const jobId = sanitizeText(body.jobId, 100);
  const coverNote = sanitizeText(body.coverNote, 2000);
  const resumeUrl = sanitizeText(body.resumeUrl, 500);

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id, status, applied_at")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "You have already applied to this job.",
        alreadyApplied: true,
        appliedAt: existing.applied_at,
        status: existing.status,
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase.from("applications").insert({
    user_id: user.id,
    job_id: jobId,
    cover_note: coverNote || null,
    resume_url: resumeUrl || null,
    status: "applied",
    applied_at: new Date().toISOString(),
  }).select("id").single();

  if (error) {
    console.error("[applications] insert error", error.message);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }

  return NextResponse.json({ applicationId: data.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(url, serviceKey);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, job_id, status, applied_at, cover_note, resume_url, withdrawn_at, jobs(title, company)")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten joined job data for easier client consumption
  const applications = (data ?? []).map((a) => {
    const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
    return { ...a, job: job ?? null, jobs: undefined };
  });

  return NextResponse.json({ applications });
}
