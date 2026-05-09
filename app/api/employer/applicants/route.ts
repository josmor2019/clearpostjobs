import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeText } from "@/lib/sanitize";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createClient(url, serviceKey);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  let query = supabase
    .from("applications")
    .select("id, job_id, user_id, status, applied_at, cover_note, resume_url")
    .order("applied_at", { ascending: false });

  if (jobId) {
    const { data: job } = await supabase
      .from("jobs")
      .select("employer_id, user_id")
      .eq("id", jobId)
      .maybeSingle();

    const isOwner = job?.employer_id === user.id || job?.user_id === user.id;
    if (!isOwner) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    query = query.eq("job_id", jobId);
  } else {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .or(`employer_id.eq.${user.id},user_id.eq.${user.id}`);

    const ids = (jobs ?? []).map((j) => j.id as string);
    if (ids.length === 0) return NextResponse.json({ applicants: [] });

    query = query.in("job_id", ids);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const apps = data ?? [];

  // Enrich with applicant names and job titles
  const userIds = [...new Set(apps.map((a) => a.user_id as string))];
  const appJobIds = [...new Set(apps.map((a) => a.job_id as string))];

  const [profilesRes, jobsRes] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
    appJobIds.length > 0
      ? supabase.from("jobs").select("id, title").in("id", appJobIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameMap = Object.fromEntries(
    ((profilesRes.data ?? []) as { id: string; full_name: string | null }[]).map((p) => [
      p.id,
      p.full_name ?? "Applicant",
    ]),
  );
  const titleMap = Object.fromEntries(
    ((jobsRes.data ?? []) as { id: string; title: string | null }[]).map((j) => [
      j.id,
      j.title ?? "Job",
    ]),
  );

  const enriched = apps.map((a) => ({
    ...a,
    applicant_name: nameMap[a.user_id as string] ?? "Applicant",
    job_title: titleMap[a.job_id as string] ?? "Unknown Role",
  }));

  return NextResponse.json({ applicants: enriched });
}

export async function PATCH(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createClient(url, serviceKey);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as { applicationId?: string; status?: string };
  const applicationId = sanitizeText(body.applicationId, 100);
  const status = sanitizeText(body.status, 50);

  if (!applicationId || !status) {
    return NextResponse.json({ error: "applicationId and status are required." }, { status: 400 });
  }

  const ALLOWED_STATUSES = ["applied", "reviewing", "interview", "rejected", "offered", "hired"];
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("job_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  const { data: job } = await supabase
    .from("jobs")
    .select("employer_id, user_id")
    .eq("id", application.job_id)
    .maybeSingle();

  const isOwner = job?.employer_id === user.id || job?.user_id === user.id;
  if (!isOwner) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { data: fullApp } = await supabase
    .from("applications")
    .select("user_id, jobs(title, company)")
    .eq("id", applicationId)
    .maybeSingle();

  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify applicant by email
  if (fullApp?.user_id) {
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", fullApp.user_id)
      .maybeSingle();

    if (applicantProfile?.email) {
      const job = Array.isArray(fullApp.jobs) ? fullApp.jobs[0] : fullApp.jobs;
      const jobTitle = (job as { title?: string } | null)?.title ?? "your role";
      const company = (job as { company?: string } | null)?.company ?? "the employer";
      const firstName = applicantProfile.first_name ?? "there";

      const STATUS_MESSAGES: Record<string, { subject: string; body: string }> = {
        reviewing: {
          subject: `Your application to ${company} is being reviewed`,
          body: `<p>Hi ${firstName},</p><p>Good news — <strong>${company}</strong> is now reviewing your application for <strong>${jobTitle}</strong>.</p><p>We'll notify you of any further updates.</p>`,
        },
        interview: {
          subject: `Interview request from ${company}`,
          body: `<p>Hi ${firstName},</p><p>Congratulations! <strong>${company}</strong> wants to schedule an interview for <strong>${jobTitle}</strong>.</p><p>Check your email for further details from the employer, or log in to your Clearpost dashboard.</p>`,
        },
        rejected: {
          subject: `Update on your application to ${company}`,
          body: `<p>Hi ${firstName},</p><p>Thank you for applying to <strong>${jobTitle}</strong> at <strong>${company}</strong>. After careful review, they've decided to move forward with other candidates.</p><p>Don't be discouraged — keep applying. Your next opportunity is out there.</p>`,
        },
        offered: {
          subject: `Offer extended from ${company}!`,
          body: `<p>Hi ${firstName},</p><p>Great news — <strong>${company}</strong> has extended an offer for <strong>${jobTitle}</strong>!</p><p>Log in to your Clearpost dashboard to view details and respond.</p>`,
        },
        hired: {
          subject: `Congratulations — you've been hired at ${company}!`,
          body: `<p>Hi ${firstName},</p><p>Congratulations! <strong>${company}</strong> has confirmed your hire for <strong>${jobTitle}</strong>. Welcome aboard!</p>`,
        },
      };

      const msg = STATUS_MESSAGES[status];
      if (msg) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearpostjobs.vercel.app";
        await sendEmail({
          to: applicantProfile.email,
          subject: msg.subject,
          html: `${msg.body}<p style="margin-top:16px;"><a href="${siteUrl}/dashboard" style="display:inline-block;padding:10px 20px;background:#1D9E75;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View Dashboard</a></p><p style="color:#666;font-size:12px;margin-top:16px;">— Clearpost</p>`,
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ success: true });
}
