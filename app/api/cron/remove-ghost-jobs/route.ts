import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);

  const { data: candidates, error: fetchError } = await supabase
    .from("jobs")
    .select("id, title, company, status, posted_at, created_at")
    .in("status", ["Active", "active", "Published", "published"])
    .lt("created_at", cutoff.toISOString());

  if (fetchError) {
    console.error("[cron/remove-ghost-jobs] fetch error", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const staleIds = (candidates ?? [])
    .filter((job) => {
      const posted = job.posted_at ?? job.created_at;
      if (!posted) return false;
      return new Date(posted) < cutoff;
    })
    .map((j) => j.id);

  if (staleIds.length === 0) {
    return NextResponse.json({ removed: 0, message: "No ghost jobs found." });
  }

  const { error: updateError } = await supabase
    .from("jobs")
    .update({ status: "Expired" })
    .in("id", staleIds);

  if (updateError) {
    console.error("[cron/remove-ghost-jobs] update error", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(`[cron/remove-ghost-jobs] expired ${staleIds.length} jobs`);
  return NextResponse.json({ removed: staleIds.length });
}
