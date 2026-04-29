// SQL migration needed:
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS flag_reasons text[];
//   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS contact_email text;
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS domain_verified boolean DEFAULT true;

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sanitizeText, sanitizeInt } from "@/lib/sanitize";
import { scanListing, extractEmailDomain, domainMatchesCompany } from "@/lib/listing-scanner";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`post-job:${user.id}:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many job posts. Try again later." },
      { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("domain_verified, company_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const body = (await request.json()) as Record<string, unknown>;

  const title = sanitizeText(body.title, 200);
  const description = sanitizeText(body.description, 10_000);
  const company = sanitizeText(body.company, 200);
  const job_type = sanitizeText(body.job_type, 50);
  const location_type = sanitizeText(body.location_type, 50);
  const location = sanitizeText(body.location, 200);
  const salary_min = sanitizeInt(body.salary_min, 0, 10_000_000) ?? 0;
  const salary_max = sanitizeInt(body.salary_max, 0, 10_000_000) ?? 0;
  const experience = sanitizeText(body.experience, 50);
  const skills = sanitizeText(body.skills, 500);
  const contact_email = sanitizeText(body.contact_email, 200);

  if (!title) return NextResponse.json({ error: "Job title is required." }, { status: 400 });
  if (!company) return NextResponse.json({ error: "Company name is required." }, { status: 400 });

  const scan = scanListing({
    title,
    description,
    company,
    salary_min,
    salary_max,
    contact_email: contact_email || undefined,
  });

  // Domain verification: check if employer email domain matches company name
  const employerEmail = profile?.email ?? user.email ?? "";
  const emailDomain = extractEmailDomain(employerEmail);
  const domainVerified =
    profile?.domain_verified !== false &&
    (domainMatchesCompany(emailDomain, company) || profile?.domain_verified === true);

  const flagReasons: string[] = [];
  if (scan.flagged) flagReasons.push(...scan.reasons);
  if (!domainVerified) flagReasons.push("Employer email domain does not match company name — pending manual verification");

  const isFlagged = flagReasons.length > 0;
  const status = isFlagged ? "Under Review" : "Active";

  const { data, error: insertError } = await supabase
    .from("jobs")
    .insert({
      title,
      description,
      company,
      job_type,
      location_type,
      location,
      salary_min,
      salary_max,
      experience,
      skills,
      contact_email: contact_email || null,
      employer_id: user.id,
      status,
      applicants: 0,
      flagged: isFlagged,
      flag_reasons: isFlagged ? flagReasons : null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[api/jobs] insert error", insertError.message);
    return NextResponse.json({ error: "Failed to post job." }, { status: 500 });
  }

  return NextResponse.json(
    {
      jobId: data.id,
      status,
      flagged: isFlagged,
      flagReasons: isFlagged ? flagReasons : [],
      message: isFlagged
        ? "Your listing is under review and will go live once approved. This usually takes 1–2 business days."
        : "Your listing is live.",
    },
    { status: 201 },
  );
}
