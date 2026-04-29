import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeText } from "@/lib/sanitize";

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

  return NextResponse.json({ applicants: data ?? [] });
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

  const { error } = await supabase
    .from("applications")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
