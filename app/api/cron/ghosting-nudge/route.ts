// Cron: run daily. Finds applications viewed by employer 14+ days ago
// with no response, and sends an automated nudge to the employer.
// Set up via Vercel Cron: schedule "0 9 * * *" → /api/cron/ghosting-nudge
// Requires env: CRON_SECRET

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/ghosting-nudge] CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cron not configured." }, { status: 503 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);

  // Find applications: viewed by employer, no response, nudge not yet sent
  const { data: stale, error } = await supabase
    .from("applications")
    .select("id, user_id, job_id, viewed_at, jobs(title, company, employer_id)")
    .eq("status", "applied")
    .not("viewed_at", "is", null)
    .is("nudge_sent_at", null)
    .lt("viewed_at", cutoff.toISOString());

  if (error) {
    console.error("[cron/ghosting-nudge] fetch error", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!stale || stale.length === 0) {
    return NextResponse.json({ nudged: 0, message: "No ghosted applications found." });
  }

  let nudged = 0;
  const nudgedIds: string[] = [];

  for (const app of stale) {
    const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
    if (!job?.employer_id) continue;

    const { data: employer } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", job.employer_id)
      .maybeSingle();

    if (!employer?.email) continue;

    await sendEmail({
      to: employer.email,
      subject: `Reminder: an applicant is waiting for a response — ${job.title ?? "your listing"}`,
      html: `
        <p>Hi,</p>
        <p>A candidate applied to <strong>${job.title ?? "your listing"}</strong> at <strong>${job.company ?? "your company"}</strong> and you viewed their application more than 14 days ago.</p>
        <p>Clearpost is committed to keeping candidates informed. Could you take a moment to update their application status — even a rejection is better than silence.</p>
        <p>It takes less than 30 seconds and helps build your company's response rate on Clearpost.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearpostjobs.com"}/employer/dashboard" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#1D9E75;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Review applicant
        </a>
        <p style="color:#666;font-size:12px;margin-top:16px;">— Clearpost Ghosting Protection</p>
      `,
    });

    nudgedIds.push(app.id);
    nudged++;
  }

  if (nudgedIds.length > 0) {
    await supabase
      .from("applications")
      .update({ nudge_sent_at: new Date().toISOString() })
      .in("id", nudgedIds);
  }

  console.log(`[cron/ghosting-nudge] sent ${nudged} nudges`);
  return NextResponse.json({ nudged });
}
