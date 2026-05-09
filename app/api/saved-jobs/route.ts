import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function getUser(request: NextRequest, supabase: ReturnType<typeof createClient>) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });

  const user = await getUser(request, supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ savedJobIds: (data ?? []).map((r) => r.job_id as string) });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });

  const user = await getUser(request, supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { jobId } = (await request.json()) as { jobId?: string };
  if (!jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });

  const { error } = await supabase.from("saved_jobs").upsert(
    { user_id: user.id, job_id: jobId, saved_at: new Date().toISOString() },
    { onConflict: "user_id,job_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });

  const user = await getUser(request, supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { jobId } = (await request.json()) as { jobId?: string };
  if (!jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
