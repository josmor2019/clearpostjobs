import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange error", error.message);
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
  }

  const redirectTo = next.startsWith("/") ? `${origin}${next}` : `${origin}/dashboard`;
  return NextResponse.redirect(redirectTo);
}
