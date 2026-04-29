// Returns response rate and average response days for an employer.
// Displayed as a public badge on job listings and detail pages.
// Caches in-memory for 5 minutes to avoid repeated DB hits on listing pages.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const cache = new Map<string, { data: ResponseStats; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

type ResponseStats = {
  responseRate: number;
  avgDays: number | null;
  totalApplications: number;
  label: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employerId = searchParams.get("employerId")?.trim();

  if (!employerId) {
    return NextResponse.json({ error: "employerId is required." }, { status: 400 });
  }

  const cached = cache.get(employerId);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch all applications for this employer's jobs
  const { data: apps, error } = await supabase
    .from("applications")
    .select("id, status, applied_at, responded_at, jobs!inner(employer_id)")
    .eq("jobs.employer_id", employerId)
    .neq("status", "withdrawn");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = apps?.length ?? 0;
  if (total === 0) {
    const stats: ResponseStats = {
      responseRate: 0,
      avgDays: null,
      totalApplications: 0,
      label: "No applications yet",
    };
    return NextResponse.json(stats);
  }

  // "Responded" = status is not "applied" (employer took action)
  const responded = (apps ?? []).filter(
    (a) => a.status !== "applied",
  );

  const responseRate = Math.round((responded.length / total) * 100);

  // Average response time in days for applications that have responded_at set
  const withResponseTime = responded.filter(
    (a) => a.responded_at && a.applied_at,
  );

  let avgDays: number | null = null;
  if (withResponseTime.length > 0) {
    const totalMs = withResponseTime.reduce((sum, a) => {
      const diff =
        new Date(a.responded_at as string).getTime() -
        new Date(a.applied_at as string).getTime();
      return sum + diff;
    }, 0);
    avgDays = Math.round(totalMs / withResponseTime.length / (1000 * 60 * 60 * 24));
  }

  const label =
    avgDays !== null
      ? `Responds to ${responseRate}% of applicants within ${avgDays} day${avgDays === 1 ? "" : "s"}`
      : `Responds to ${responseRate}% of applicants`;

  const stats: ResponseStats = { responseRate, avgDays, totalApplications: total, label };

  cache.set(employerId, { data: stats, expiresAt: Date.now() + CACHE_TTL });
  return NextResponse.json(stats);
}
