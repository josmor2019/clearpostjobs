import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Date.now();
  const thisWeekStart = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const lastWeekStart = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  const [thisWeek, lastWeek] = await Promise.all([
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("applied_at", thisWeekStart),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("applied_at", lastWeekStart)
      .lt("applied_at", thisWeekStart),
  ]);

  return NextResponse.json({
    thisWeek: thisWeek.count ?? 0,
    lastWeek: lastWeek.count ?? 0,
  });
}
