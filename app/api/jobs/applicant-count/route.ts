import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("jobIds") ?? "";
  const jobIds = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 50);
  if (jobIds.length === 0) return NextResponse.json({});

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("applications")
    .select("job_id")
    .in("job_id", jobIds)
    .gte("applied_at", since);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const id = String(row.job_id);
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return NextResponse.json(counts);
}
