// SQL migration needed:
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS responded_at timestamptz;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS viewed_at timestamptz;
//   ALTER TABLE applications ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;
// Update status constraint to include "withdrawn"

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: applicationId } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  // Fetch application and verify ownership
  const { data: app, error: fetchErr } = await supabase
    .from("applications")
    .select("id, user_id, status, job_id, jobs(title, company, employer_id)")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !app) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (app.status === "withdrawn") {
    return NextResponse.json({ error: "Application is already withdrawn." }, { status: 409 });
  }

  const { error: updateErr } = await supabase
    .from("applications")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (updateErr) {
    return NextResponse.json({ error: "Failed to withdraw application." }, { status: 500 });
  }

  // Notify the employer
  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
  if (job?.employer_id) {
    const { data: employer } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", job.employer_id)
      .maybeSingle();

    if (employer?.email) {
      await sendEmail({
        to: employer.email,
        subject: `Application withdrawn — ${job.title ?? "your listing"}`,
        html: `
          <p>A candidate has withdrawn their application for <strong>${job.title ?? "your listing"}</strong> at <strong>${job.company ?? "your company"}</strong>.</p>
          <p>No further action is needed. This application has been removed from your review queue.</p>
          <p style="color:#666;font-size:12px;">— Clearpost</p>
        `,
      });
    }
  }

  return NextResponse.json({ success: true });
}
