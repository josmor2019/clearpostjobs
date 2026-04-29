import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Sync the session token into a cookie so the server-side middleware (proxy.ts)
// can read it. Must run client-side only.
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      const maxAge = session.expires_in ?? 3600;
      const secure = location.protocol === "https:" ? "; secure" : "";
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
    } else if (event === "SIGNED_OUT") {
      document.cookie = "sb-access-token=; path=/; max-age=0";
    }
  });
}
