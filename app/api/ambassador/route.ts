import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    school?: string;
    year?: string;
    why?: string;
  };

  const name = sanitizeText(body.name, 100);
  const email = sanitizeText(body.email, 200);
  const school = sanitizeText(body.school, 200);
  const year = sanitizeText(body.year, 50);
  const why = sanitizeText(body.why, 2000);

  if (!name || !email || !school || !year || !why) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey);

  const { data: existing } = await supabase
    .from("ambassador_applications")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "An application with this email already exists." }, { status: 409 });
  }

  const { error } = await supabase.from("ambassador_applications").insert({
    name,
    email,
    school,
    year,
    why,
    status: "pending",
    applied_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[ambassador] insert error", error.message);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
