// SQL migration needed:
//   CREATE TABLE IF NOT EXISTS flagged_accounts (
//     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id uuid REFERENCES auth.users NOT NULL,
//     reason text NOT NULL,
//     flagged_at timestamptz DEFAULT now(),
//     resolved_at timestamptz,
//     paused_until timestamptz
//   );
//
// Add admin check: set profiles.is_admin = true for admin users.

import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(token: string, supabase: SupabaseClient<any>) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (profile as Record<string, unknown>)?.is_admin === true ? user : null;
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim() ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);
  const admin = await requireAdmin(token, supabase);
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";

  const [accountsResult, listingsResult] = await Promise.all([
    type !== "listings"
      ? supabase
          .from("flagged_accounts")
          .select("id, user_id, reason, flagged_at, resolved_at, paused_until")
          .is("resolved_at", null)
          .order("flagged_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),

    type !== "accounts"
      ? supabase
          .from("jobs")
          .select("id, title, company, flag_reasons, created_at, employer_id")
          .eq("flagged", true)
          .eq("status", "Under Review")
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
  ]);

  return NextResponse.json({
    flaggedAccounts: accountsResult.data ?? [],
    flaggedListings: listingsResult.data ?? [],
  });
}

export async function PATCH(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim() ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);
  const admin = await requireAdmin(token, supabase);
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = (await request.json()) as {
    type: "account" | "listing";
    id: string;
    action: "approve" | "reject";
  };

  if (body.type === "account") {
    await supabase
      .from("flagged_accounts")
      .update({ resolved_at: new Date().toISOString(), paused_until: null })
      .eq("id", body.id);

    return NextResponse.json({ success: true });
  }

  if (body.type === "listing") {
    const newStatus = body.action === "approve" ? "Active" : "Rejected";
    await supabase
      .from("jobs")
      .update({ status: newStatus, flagged: body.action !== "approve" })
      .eq("id", body.id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type." }, { status: 400 });
}
